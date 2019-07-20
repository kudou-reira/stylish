# https://hub.docker.com/r/library/python/tags/
# maybe look at this if it doesn't work https://docs.nvidia.com/deeplearning/dgx/pytorch-release-notes/running.html
# FROM python:3.6
FROM anibali/pytorch:cuda-10.0

ENV CELERY_BROKER_URL redis://redis:6379/0
ENV CELERY_RESULT_BACKEND redis://redis:6379/0
ENV C_FORCE_ROOT true

# Coping source in current directory into the image
# python:3-onbuild expects the source in /usr/src/app
COPY requirements.txt /usr/src/app/requirements.txt
WORKDIR /usr/src/app
RUN sudo apt-get update && sudo apt-get install -y \
    libsm6 \
    libxrender1 \
    libfontconfig1 \
    python3-pip
RUN python3 -m pip install --upgrade pip
RUN pip install -r requirements.txt
# RUN pip install https://download.pytorch.org/whl/cu100/torch-1.0.0-cp36-cp36m-linux_x86_64.whl
# RUN pip install torchvision
COPY . /usr/src/app/

# Commands in a list
CMD ["python3", "api.py"]