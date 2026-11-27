# Local Kafka

This Compose project runs one Apache Kafka broker in combined broker/controller KRaft mode. It does not use ZooKeeper and does not start any other infrastructure.

## Start

From the repository root:

```powershell
docker compose -f infra/kafka/compose.yml up -d
```

The first start pulls `apache/kafka:4.1.2` if it is not already present.

## Stop and preserve data

```powershell
docker compose -f infra/kafka/compose.yml down
```

This removes the container and Compose network but retains the named `kafka_data` volume. Do not add `-v` to `down` if you want to keep stored Kafka data. To remove the data intentionally, use `docker compose -f infra/kafka/compose.yml down -v`.

## Status and logs

```powershell
docker compose -f infra/kafka/compose.yml ps
docker compose -f infra/kafka/compose.yml logs -f kafka
```

`ps` reports the health-check state when available. The container becomes healthy when Kafka responds to a broker API versions request.

## Connection addresses

- Spring Boot services running directly on Windows: `localhost:9092`
- Containers on this Compose project's default network: `kafka:29092`

For a different Compose project, attach its container/service to the Kafka Compose network (the default network is named `kafka_default` unless the project name is overridden), then use `kafka:29092`. Containers in separate Compose projects are not connected automatically. The published `29092` port is also bound on the Docker host, but clients inside Docker should use the service hostname above so their metadata resolves to a reachable address.

The KRaft controller listener uses port `9093`; it is for Kafka's internal quorum communication, not application clients.

## Verify readiness

Wait until the health status is `healthy`:

```powershell
docker compose -f infra/kafka/compose.yml ps
```

Or query the broker API from inside the container:

```powershell
docker compose -f infra/kafka/compose.yml exec kafka /opt/kafka/bin/kafka-broker-api-versions.sh --bootstrap-server localhost:9092
```

A successful command returning broker/API information confirms that Kafka is accepting client connections. A `starting` status during initial startup is expected; check the logs if it does not become healthy.
