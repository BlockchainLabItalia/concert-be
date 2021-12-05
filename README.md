# concert-be

# Installare gli strumenti necessari
```
sudo apt update
sudo apt install -y git wget curl tar unzip zip ntp make build-essential
```
## Installare *node* e *npm* tramite *nvm*

### nvm
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

export NVM_DIR="$HOME/.nvm"

[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

### node e npm
```
nvm install 12.20.2
```

## Installare PM2

```
npm install -g pm2

pm2 update

pm2 completion install
```

# Clonare il repository

```
git clone https://github.com/BlockchainLabItalia/concert-be.git
```

## Installare i pacchetti necessari
```
cd concert-be/

npm install
```

### Da questo momento vanno seguite due procedure diverse a seconda che il nodo che si sta installando sia il [`Nodo Forgiatore`](#NODO_FORGIATORE) o il [`Nodo che espone le API`](#NODO_API).  <br><br>

# **NODO_FORGIATORE**

> Questo Server sarà il Nodo principale della Blockchain. Al momento è l'unico nodo che contiene informazioni sui Wallet che possono Forgiare nuovi blocchi.  

> Per il funzionamento della Blockchain è importante che questo Nodo sia **sempre attivo**.

<br>

## Modificare le costanti nel File di Configurazione

<br>

Aprire il file [`pm2.conf.json`](./pm2.conf.json).  
Modificare la Variabile IS_FORGING_NODE:

```
    [...]

    "IS_FORGING_NODE":true,

    [...]
```
In questo modo il valore delle Variabili FORGING_NODE_IP e FORGING_NODE_PORT verrà ignorato.

## Lanciare il Nodo

```
pm2 start pm2.conf.json
```
### Salvare la configurazione  di pm2

```
pm2 save
```
Per verificare che il programma sia stato eseguito correttamente sarà  possibile controllare i log con
```
pm2 logs concert
```

# **NODO_API**

> Questo Nodo si connetterà al Nodo Forgiatore e si sincronizzerà con esso. Inoltre Esporrà i servizi che saranno chiamati  dal client Web.

> Per il funzionamento del Client Web è importante che questo Nodo sia **sempre attivo**.

> Questo nodo dovrà disporre di un certificato SSL.  
> In questo README è presente un esempio di configurazione con Apache.  

<br>

## Modificare le costanti nel File di Configurazione

<br>

Aprire il file [`pm2.conf.json`](./pm2.conf.json).  
Modificare la Variabile FORGING_NODE_IP sostituendo *< INDIRIZZO_IP_FORGING_NODE >* con l'indirizzo IP del Server del [`Nodo Forgiatore`](#NODO_FORGIATORE).

```
    [...]

    "IS_FORGING_NODE":false,
    "FORGING_NODE_IP": "< INDIRIZZO_IP_FORGING_NODE >",
    "FORGING_NODE_PORT": 5000

    [...]
```
## Lanciare il Nodo

```
pm2 start pm2.conf.json
```
### Salvare la configurazione  di pm2

```
pm2 save
```
Per verificare che il programma sia stato eseguito correttamente sarà  possibile controllare i log con
```
pm2 logs concert
```
---
***
___ 

# **Installare e Configurare Apache**

```
sudo apt-get install apache2 
```
> Per ottenere un certificato gratuito con Let's Encrypt installare anche **certbot**

>```
> sudo apt install python3-certbot-apache
>```

### Configurare Virtual Host Apache  

<br>

Disabilitare configurazione di Default
```
sudo a2dissite 000-default.conf 
```
Creare nuovo File di Configurazione per *nome_del_dominio*

```
sudo nano /etc/apache2/sites-available/nome_del_dominio.conf
```
> sostituire *nome_del_dominio* con il dominio completo del server.  
> Es. /etc/apache2/sites-available/example.org.conf

Incollare la seguante configurazione di default, sostituendo i campi *<nome_del_dominio>* e *<email_amministratore>* con gli opportuni campi:

```
<VirtualHost *:80>
    
    ServerAdmin <email_amministratore>      
    ServerName <nome_del_dominio>
    ServerAlias www.<nome_del_dominio>
    
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
    RewriteEngine on
    RewriteCond %{SERVER_NAME} =<nome_del_dominio> [OR]
    RewriteCond %{SERVER_NAME} =www.<nome_del_dominio>
    RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]

</VirtualHost>
```

Abilitare la nuova configurazione:
```
sudo a2ensite <nome_del_dominio>.conf 
```
Prima di procedere controllare la configurazione con:
```
sudo apache2ctl configtest
```
Riavviare apache
```
sudo systemctl restart apache2
```

<br>

> In caso si utilizzi let's encrypt per il certificato eseguire:
>```
> sudo certbot --apache -d nome_del_dominio
>```

Modificare ora il file di configurazione del dominio con certificato SSL:

```
sudo nano nome_del_dominio-le-ssl.conf
```
Modifire, sostituendo i campi <nome_del_dominio> e <email_amministratore> (ed eventualmente anche i campi relativi ai certificati SSL) con gli opportuni campi, in modo che risulti simile al seguente:
```
<IfModule mod_ssl.c>
<VirtualHost *:443>
    RewriteEngine On
    ProxyPreserveHost On
    ProxyRequests Off

    # allow for upgrading to websockets
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)           ws://localhost:3003/$1 [P,L]
    RewriteCond %{HTTP:Upgrade} !=websocket [NC]
    RewriteRule /(.*)           http://localhost:3001/$1 [P,L]


    ProxyPass "/api/ipfs" "http://localhost:3001/api/ipfs"
    ProxyPassReverse "/api/ipfs" "http://localhost:3001/api/ipfs"

    ProxyPass "/ws" "ws://localhost:3003/ws"
    ProxyPassReverse "/ws" "ws://localhost:3003/ws"

    ServerAdmin <email_amministratore>      
    ServerName <nome_del_dominio>
    ServerAlias www.<nome_del_dominio>
    
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined

SSLCertificateFile /etc/letsencrypt/live/<nome_del_dominio>/fullchain.pem
SSLCertificateKeyFile /etc/letsencrypt/live/<nome_del_dominio>/privkey.pem
Include /etc/letsencrypt/options-ssl-apache.conf
</VirtualHost>
</IfModule>
```

Abilitare quindi il modulo *proxy_http*:
```
sudo a2enmod proxy_http
```
Testare la configurazione:
```
sudo apache2ctl configtest
```
ed in caso sia tutto OK riavviare apache:
```
sudo systemctl restart apache2
```
