FROM python:3.9-slim-buster

RUN mkdir /api
COPY . /api

WORKDIR /api

RUN apt update
RUN apt install git firefox-esr=78.12.0esr-1~deb10u1 tor -y

RUN pip install -r /api/requirements.txt
RUN pip install --upgrade git+https://github.com/twintproject/twint.git@origin/master#egg=twint