image:
	yarn run build
	docker buildx build --platform=linux/amd64 -t labelme-web:v1.0 .

test:
	docker run -it -p 8080:80 labelme-web:v1.0

push: image
	docker save labelme-web:v1.0 | gzip > labelme-web.tgz