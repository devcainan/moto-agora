# 🐋 Docker Deploy - Moto Agora

Guia completo para fazer deploy do site Moto Agora usando Docker.

## 📋 Pré-requisitos

- Docker instalado ([Download Docker](https://www.docker.com/get-started))
- Docker Compose instalado (já vem com Docker Desktop)

## 🚀 Deploy Rápido

### 1. Build da imagem

```bash
docker build -t moto-agora:latest .
```

### 2. Executar com Docker Compose (Recomendado)

```bash
docker-compose up -d
```

### 3. Ou executar direto com Docker

```bash
docker run -d -p 80:80 --name moto-agora-web moto-agora:latest
```

## 📦 Comandos Úteis

### Ver logs do container

```bash
docker-compose logs -f
```

ou

```bash
docker logs -f moto-agora-website
```

### Parar o container

```bash
docker-compose down
```

ou

```bash
docker stop moto-agora-website
```

### Reiniciar o container

```bash
docker-compose restart
```

ou

```bash
docker restart moto-agora-website
```

### Ver status

```bash
docker-compose ps
```

ou

```bash
docker ps
```

### Acessar o container

```bash
docker exec -it moto-agora-website sh
```

### Remover container e imagem

```bash
docker-compose down
docker rmi moto-agora:latest
```

## 🌐 Acessar o Site

Após o deploy, acesse:

- **Local:** http://localhost
- **Produção:** http://seu-ip-ou-dominio

## 📊 Health Check

O container possui health check automático que verifica a cada 30 segundos se o site está respondendo.

Ver status do health check:

```bash
docker inspect --format='{{json .State.Health}}' moto-agora-website
```

## ⚙️ Configurações

### Portas

- **Porta padrão:** 80
- Para usar outra porta, edite `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Exemplo: usar porta 8080
```

### Recursos (Limites opcionais)

Adicione ao `docker-compose.yml` em `services.moto-agora-web`:

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

## 🔧 Troubleshooting

### Porta 80 já está em uso

```bash
# Parar serviço que está usando a porta
sudo systemctl stop apache2  # ou nginx, se tiver instalado

# Ou usar outra porta
docker run -d -p 8080:80 --name moto-agora-web moto-agora:latest
```

### Container não inicia

```bash
# Ver logs detalhados
docker logs moto-agora-website

# Verificar se a imagem foi criada corretamente
docker images | grep moto-agora
```

### Rebuild após mudanças no código

```bash
# Com docker-compose
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Sem docker-compose
docker stop moto-agora-website
docker rm moto-agora-website
docker build --no-cache -t moto-agora:latest .
docker run -d -p 80:80 --name moto-agora-web moto-agora:latest
```

## 📝 Arquivos Docker

- **Dockerfile:** Instruções de build da imagem
- **docker-compose.yml:** Orquestração do container
- **nginx.conf:** Configuração otimizada do Nginx
- **.dockerignore:** Arquivos excluídos do build

## 🚀 Deploy em Produção

### Docker Hub (opcional)

```bash
# Login no Docker Hub
docker login

# Tag da imagem
docker tag moto-agora:latest seu-usuario/moto-agora:latest

# Push para Docker Hub
docker push seu-usuario/moto-agora:latest
```

### VPS/Cloud (DigitalOcean, AWS, etc)

1. Conectar no servidor via SSH
2. Instalar Docker
3. Clonar repositório ou fazer upload dos arquivos
4. Executar `docker-compose up -d`

### Reverse Proxy com SSL (Nginx/Traefik)

Para usar HTTPS, configure um reverse proxy na frente do container.

Exemplo com Nginx (no servidor host):

```nginx
server {
    listen 443 ssl http2;
    server_name motoagora.com.br;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## ✅ Checklist de Deploy

- [ ] Build da imagem funcionou sem erros
- [ ] Container está rodando (`docker ps`)
- [ ] Health check está OK
- [ ] Site acessível no navegador
- [ ] Imagens carregando corretamente
- [ ] Vídeo de background funcionando
- [ ] Links do WhatsApp funcionando
- [ ] Parallax funcionando (desktop)
- [ ] Responsividade mobile OK
- [ ] Tempo de carregamento aceitável

## 📞 Suporte

Para dúvidas sobre o deploy Docker, consulte:

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Moto Agora** - Aluguel de Motos | 2026
