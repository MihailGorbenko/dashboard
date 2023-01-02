
FROM node
WORKDIR /dashboard
COPY package.json .
RUN npm i
COPY . .
RUN apt-get update || : && apt-get install python -y
RUN apt-get install pip -y
RUN apt-get install ffmpeg libsm6 libxext6  -y
RUN pip install numpy opencv-python 

EXPOSE 5000
EXPOSE 5001

VOLUME /dashboard/storage

CMD ["node", "app.js"]
