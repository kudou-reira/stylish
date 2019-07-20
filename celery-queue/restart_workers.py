import sys
sys.dont_write_bytecode = True

import time
from watchdog.observers import Observer  ##pip install watchdog
from watchdog.events import PatternMatchingEventHandler  
import psutil  ##pip install psutil
import os
import os.path as path
import subprocess
import numpy as np

current_directory = os.getcwd()

code_dir_to_monitor = current_directory
# code_dir_to_monitor = "./queue"
celery_working_dir = code_dir_to_monitor #happen to be the same. It may be different on your machine
random_name = "worker" + str(np.random.randint(10000))
celery_cmdline = 'celery worker -A tasks -l INFO -n {}@%h'.format(random_name).split(" ")

class MyHandler(PatternMatchingEventHandler):

    def on_any_event(self, event):
        print("detected change. event = {}".format(event))

        for proc in psutil.process_iter():
            proc_cmdline = self._get_proc_cmdline(proc)
            if not proc_cmdline or len(proc_cmdline) < len(celery_cmdline):
                continue

            is_celery_worker = 'python' in proc_cmdline[0].lower() \
                               and celery_cmdline[0] == proc_cmdline[1] \
                               and celery_cmdline[1] == proc_cmdline[2]
            
            if not is_celery_worker:
                continue

            proc.kill()
            print("Just killed {} on working dir {}".format(proc_cmdline, proc.cwd()))

        run_worker()

    def _get_proc_cmdline(self, proc):
        try:
            return proc.cmdline()
        except Exception as e:
            return []


def run_worker():
    print("Ready to call {} ".format(celery_cmdline))
    os.chdir(celery_working_dir)
    subprocess.Popen(celery_cmdline)
    print("Done callling {} ".format(celery_cmdline))

if __name__ == "__main__":
    run_worker()
    print("this is current directory", current_directory)

    event_handler = MyHandler(patterns = ["*.py"])
    observer = Observer()
    observer.schedule(event_handler, code_dir_to_monitor, recursive=True)
    observer.start()
    print("file change observer started")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()