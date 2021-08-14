FROM python:3.9-slim-buster

RUN mkdir /api
COPY . /api

WORKDIR /api

RUN apt update
RUN apt install git tor -y

RUN apt install /api/bin/libevent-2.1-6_2.1.8-stable-4_amd64.deb
RUN apt install /api/bin/libffi6_3.2.1-9_amd64.deb
RUN apt install /api/bin/firefox-esr_78.13.0esr-1_deb10u1_amd64.deb -y

RUN pip install -r /api/requirements.txt
RUN pip install --upgrade git+https://github.com/twintproject/twint.git@origin/master#egg=twint