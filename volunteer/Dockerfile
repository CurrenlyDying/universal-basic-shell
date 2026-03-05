FROM alpine:3.20
RUN apk add --no-cache bash curl wireguard-tools dante-server
COPY start.sh /start.sh
RUN chmod +x /start.sh
CMD ["/start.sh"]
