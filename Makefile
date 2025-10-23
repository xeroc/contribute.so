docker:
	docker build --no-cache -f packages/scheduler/Dockerfile -t scheduler --progress plain .
