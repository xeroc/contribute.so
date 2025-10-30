variable "producer_image_version" {
  type    = string
  default = "0.0.2"
}
variable "consumers" {
  type = list(object({
    name          = string
    image_name    = string
    image_version = string
    count         = number
  }))
  default = [
    {
      name          = "mongo"
      image_name    = "consumer-mongo"
      image_version = "0.0.2"
      count         = 1
    }
  ]
}
variable "registry_auth" {
  type = object({
    username = string
    password = string
  })
}
variable "datacenters" {
  type    = list(string)
  default = ["de1"]
}
job "contributeso-history" {
  datacenters = var.datacenters
  type        = "service"

  update {
    auto_revert  = true
    auto_promote = true
    canary       = 1
  }

  group "redis" {
    network {
      mode = "bridge"
      port "redis" {
        to     = 6379
        static = 6381
      }
    }
    service {
      name = "contributeso-history-redis"
      port = "redis"
      check {
        name     = "redis service port alive"
        type     = "tcp"
        interval = "10s"
        timeout  = "2s"
      }
    }
    task "redis" {
      driver = "docker"
      config {
        image = "redis"
      }
      resources {
        memory = 128
        cpu    = 120
      }
    }
  }

  group "producer" {
    count = 1
    network {
      mode = "bridge"
    }
    task "producer" {
      driver = "docker"
      config {
        image = "ghcr.io/contribute-so/producer:${var.producer_image_version}"
        auth {
          username = "${var.registry_auth.username}"
          password = "${var.registry_auth.password}"
        }
      }
      vault {
        policies    = ["contributeso-history"]
        change_mode = "restart"
      }
      template {
        data        = <<-EOF
          {{with secret "secrets/data/contribute/history"}}
          {{ range $k, $v := .Data.data }}
          {{ $k }}={{ $v }}
          {{ end }}{{ end }}
          {{ with service "kafka" }}{{ with index . 0 }}
          KAFKA_BOOTSTRAP_SERVERS = {{.Address}}:{{.Port}}
          {{ end }}{{ end }}
          {{ with service "contributeso-history-redis|any" }}{{ with index . 0 }}
          REDIS_URL = redis://{{.Address}}:{{.Port}}
          {{ end }}{{ end }}
        EOF
        destination = "secrets/config.env"
        env         = true
      }
      template {
        data        = <<-EOF
            {{ keyOrDefault "contributeso-history/config"  "" }}
        EOF
        destination = "local/config.env"
        env         = true
      }
      env {
        APP_LOGLEVEL = "debug"
      }
      resources {
        cpu    = 1000
        memory = 512
      }
    }
  }

  dynamic "group" {
    for_each = var.consumers
    labels   = ["consumer-${group.value.name}"]

    content {
      count = group.value.count
      # Since we have no ports, we must not use bridge mode!
      # If we did, we couldn't not reach any service that is on the same host
      # network {
      #   mode = "bridge"
      # }
      task "consumer" {
        driver = "docker"
        config {
          image = "ghcr.io/contribute-so/${group.value.image_name}:${group.value.image_version}"
          auth {
            username = "${var.registry_auth.username}"
            password = "${var.registry_auth.password}"
          }
        }
        vault {
          policies    = ["contributeso-history"]
          change_mode = "restart"
        }
        template {
          data        = <<-EOF
            {{with secret "secrets/data/contribute/history"}}
            {{ range $k, $v := .Data.data }}
            {{ $k }}={{ $v }}
            {{ end }}{{ end }}
            # FIXME: only supports a single kafka server and breaks when adding a "," like in the producer
            {{ with service "kafka" }}{{ with index . 0 }}
            KAFKA_BOOTSTRAP_SERVERS = {{.Address}}:{{.Port}}
            {{ end }}{{ end }}
            {{ with service "contributeso-history-redis|any" }}{{ with index . 0 }}
            REDIS_URL = redis://{{.Address}}:{{.Port}}
            {{ end }}{{ end }}
          EOF
          destination = "secrets/config.env"
          env         = true
        }
        template {
          data        = <<-EOF
              {{ keyOrDefault "contributeso-history/config"  "" }}
          EOF
          destination = "local/config.env"
          env         = true
        }
        env {
          APP_LOGLEVEL = "debug"
          # https://stackoverflow.com/questions/53230823/fatal-error-ineffective-mark-compacts-near-heap-limit-allocation-failed-javas
          NODE_OPTIONS = "--max-old-space-size=2048"
        }
        resources {
          cpu    = 1000
          memory = 256
        }
      }
    }
  }
}
