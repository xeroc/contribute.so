variable "registry_auth" {
  type = object({
    username = string
    password = string
  })
}

job "contribute-scheduler" {
  datacenters = ["de1"]
  type        = "service"

  update {
    auto_revert  = true
    auto_promote = true
    canary       = 1
  }

  group "app" {
    network {
      mode = "bridge"
      # port "http" {
      #   to = 8000
      # }
    }
    # service {
    #   name = "na"
    #   port = "http"
    #   tags = [
    #     "traefik.enable=true",
    #     "traefik.http.routers.${NOMAD_GROUP_NAME}.tls=true",
    #     "traefik.http.routers.${NOMAD_GROUP_NAME}.tls.certresolver=letsencrypt",
    #     "traefik.http.routers.${NOMAD_GROUP_NAME}.rule=(Host(``))",
    #   ]
    # }
    task "app" {
      driver = "docker"
      config {
        image = "ghcr.io/contribute-so/scheduler:0.1.2"
        auth {
          username = "${var.registry_auth.username}"
          password = "${var.registry_auth.password}"
        }
      }
      env {
        DATABASE_URL="not-yet-implemented"
        # Every 5 minutes
        CRON_SCHEDULE="*/5 * * * *"
      }
      vault {
        policies = ["contribute-scheduler"]
        change_mode = "restart"
      }
      template {
        destination = "secrets/config.env"
        data =<<-EOF
          {{ with secret "secrets/data/contribute/scheduler" }}
          {{ range $k, $v := .Data.data }}
          {{ $k }}={{ $v }}
          {{ end }}{{ end }}
        EOF
        env = true
      }
      resources {
        cpu    = 2000
        memory = 1024
      }
    }
  }
}
