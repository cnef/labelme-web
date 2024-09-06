FROM nginx:1.16.1-alpine

RUN rm /etc/nginx/conf.d/default.conf

ADD nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/
