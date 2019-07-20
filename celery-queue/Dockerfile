# FROM python:3.6-alpine
FROM anibali/pytorch:cuda-10.0

ENV CELERY_BROKER_URL redis://redis:6379/0
ENV CELERY_RESULT_BACKEND redis://redis:6379/0
ENV C_FORCE_ROOT true

ENV DEBIAN_FRONTEND noninteractive
ENV PYTHONDONTWRITEBYTECODE=1

USER root

RUN sudo apt-get update && sudo apt-get install -y \
    libsm6 \
    libxrender1 \
    libfontconfig1 \
    python3-pip \
    && sudo apt-get install curl gnupg -yq \
    && sudo curl -sL https://deb.nodesource.com/setup_8.x | bash \
    && sudo apt-get install nodejs -yq

RUN sudo npm i -g nodemon

# RUN sudo curl -sL https://deb.nodesource.com/setup_8.x | bash
# RUN sudo apt-get install --yes nodejs
# RUN sudo node -v
# RUN sudo npm -v
# RUN sudo npm i -g nodemon
# RUN sudo nodemon -v

COPY . /queue
WORKDIR /queue

RUN python3 -m pip install --upgrade pip
RUN pip install -r requirements.txt

ENV DEBIAN_FRONTEND teletype

# CMD [ \
#   "watchmedo", \
#   "auto-restart", \
#   "--directory", "./queue", \
#   "--patterns", "*.py", \
#   "--recursive", \
#   "--", \
#   "celery", \
#   "-A", "tasks", \
#   "worker", \
#   "--concurrency", "1", \
#   "--pool", "solo", \
#   "--events", \
#   "-l", "INFO" \
# ]

# ENTRYPOINT watchmedo auto-restart --recursive --pattern="*.py" --directory="." -- celery -A tasks worker --loglevel=info
# ENTRYPOINT celery -A tasks worker --loglevel=info

# CMD ["nodemon", "--watch", "/queue", "--exec", "python", "./restart_workers.py"]

# ENTRYPOINT python ./run_celery /queue