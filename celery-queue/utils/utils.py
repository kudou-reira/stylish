from PIL import Image
import io
from io import BytesIO
import cv2
import base64 
import numpy as np
import smtplib

import json
from pprint import pprint

import os
import glob

import torch


# def compareFolders(folder1, folder2):
#     input_file = os.listdir(folder1)[0]
#     print("this is input file", input_file)
#     files = glob.glob(folder2)
#     print("this is files", files)
#     for f in files:
#         os.remove(input_file)

# Take in base64 string and return PIL image
def stringToImage(base64_string, file_type):
    if file_type == 'image/png':
        base64_string = base64_string.replace('data:image/png;base64,','')
    elif file_type == 'image/jpeg':
        base64_string = base64_string.replace('data:image/jpeg;base64,','')
    imgdata = base64.b64decode(base64_string)
    return Image.open(io.BytesIO(imgdata)).convert('RGB')

def toRGB(image):
    # cv2.cvtColor(np.array(image), cv2.COLOR_BGR2RGB)
    return np.array(image)

def imgToString(np_arr):
    pil_img = Image.fromarray(np_arr)
    buff = BytesIO()
    pil_img.save(buff, format="PNG")
    return base64.b64encode(buff.getvalue()).decode("utf-8")

def send_email(recipient, link):
    # script_dir = os.path.dirname(__file__)
    # file_path = os.path.join(script_dir, '../keys/keys.json')

    with open('keys/keys.json') as data_file:    
        data = json.load(data_file)

    user = data["root_email"]["login"]
    pwd = data["root_email"]["pass"]

    FROM = user
    TO = recipient if isinstance(recipient, list) else [recipient]
    SUBJECT = data["email_contents"]["subject"]
    TEXT = data["email_contents"]["body"] + link

    # Prepare actual message
    message = """From: %s\nTo: %s\nSubject: %s\n\n%s
    """ % (FROM, ", ".join(TO), SUBJECT, TEXT)
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.ehlo()
        server.starttls()
        server.login(user, pwd)
        server.sendmail(FROM, TO, message)
        server.close()
        print('successfully sent the mail')
    except:
        print("failed to send mail")

def create_dir(directory):
    try:
        if not os.path.exists(directory):
            os.makedirs(directory)
    except OSError:
        print ('Error: Creating directory. ' +  directory)

def saveImg(img, file_name):
    im = Image.fromarray(img)
    im.save(file_name)

def rescaleImg(img, height, width, max_height):
    rescale_factor = float(max_height/height)
    rescale_width = int(width * rescale_factor)
    rescaled_img = cv2.resize(img, dsize=(rescale_width, max_height), interpolation=cv2.INTER_CUBIC)
    return rescaled_img

def checkGPU():
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print('Using device:', device)
    print()

    #Additional Info when using cuda
    if device.type == 'cuda':
        print(torch.cuda.get_device_name(0))
        print('Memory Usage:')
        allocated = round(torch.cuda.memory_allocated(0)/1024**3,1)
        cached = round(torch.cuda.memory_cached(0)/1024**3,1)
        
        print('Allocated:', allocated, 'GB')
        print('Cached:   ', cached, 'GB')

        if allocated + cached > 8:
            return False
        else:
            return True