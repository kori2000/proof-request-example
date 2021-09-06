build:
	docker-compose build
up:
	docker-compose up -d
	sleep 3
	docker logs pr-usecase
down:
	docker-compose down