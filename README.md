# conoha-dns

ConoHaのDNS APIをCLIで操作するヤツです。
このツールを使って問題が起きても一切責任は負いませんので自己責任でお願いします！

## インストール

### node/npm が入っている場合

```sh
$ npm install --global conoha-dns
```

### 入っていない場合



## 使い方

`$ conoha-dns help`もみてね。

### 認証
```sh
$ conoha-dns auth -U [APIユーザ] -P [パスワード] -T [テナントID]
OK
```
`.***sh_history`に残っちゃうのが嫌だよ！って場合は
```sh
$ conoha-dns auth
```
ってするとプロンプトでパスワードとかを入力できます。


### ドメインの追加
```sh
$ conoha-dns add xn--vnuz72aq84a.com
id                                    name                  ttl 
------------------------------------  --------------------  ----
bf303b70-57b9-4224-ba63-d82789a38f88  xn--vnuz72aq84a.com.  3600

$ conoha-dns add narusejun.com
id                                    name            ttl 
------------------------------------  --------------  ----
c5cc6b53-2193-4a41-bc36-540fe317d00d  narusejun.com.  3600
```

### ドメイン一覧表示
```
$ conoha-dns list
id                                    name                  ttl 
------------------------------------  --------------------  ----
bf303b70-57b9-4224-ba63-d82789a38f88  xn--vnuz72aq84a.com.  3600
c5cc6b53-2193-4a41-bc36-540fe317d00d  narusejun.com.        3600
```

### ドメイン設定更新
```sh
$ conoha-dns update xn--vnuz72aq84a.com --ttl 60
id                                    name                  ttl
------------------------------------  --------------------  ---
bf303b70-57b9-4224-ba63-d82789a38f88  xn--vnuz72aq84a.com.  60 
```

### ドメインの削除
```sh
$ conoha-dns remove xn--vnuz72aq84a.com
OK
```

### レコードの追加
`-t`でレコードタイプの指定、`-d`でレコードデータの指定、`-p`で優先度の指定ができます。
```sh
$ conoha-dns add narusejun.com -t A -d 1.2.3.4
id                                    name            type  ttl   data     priority
------------------------------------  --------------  ----  ----  -------  --------
459c6bb0-3be6-42a5-bb07-0cd015d52ff3  narusejun.com.  A     3600  1.2.3.4  null    

$ conoha-dns add v6.narusejun.com -t AAAA -d ::1
id                                    name               type  ttl   data  priority
------------------------------------  -----------------  ----  ----  ----  --------
dcd021fd-d7ef-4b48-bff9-88bd7a82a66a  v6.narusejun.com.  AAAA  3600  ::1   null    

$ conoha-dns add narusejun.com -t MX -d mail.narusejun.com -p 10
id                                    name            type  ttl   data                 priority
------------------------------------  --------------  ----  ----  -------------------  --------
ba83e0a9-f949-4abb-bc9d-256b8ede1699  narusejun.com.  MX    3600  mail.narusejun.com.  10      

$ conoha-dns add www.narusejun.com -t CNAME -d narusejun.com
id                                    name                type   ttl   data            priority
------------------------------------  ------------------  -----  ----  --------------  --------
fbf61009-34f0-497c-adcb-db9a6742925f  www.narusejun.com.  CNAME  3600  narusejun.com.  null    
```

### レコード一覧表示
```sh
$ conoha-dns list narusejun.com
id                                    name                type   ttl   data                                                                     priority
------------------------------------  ------------------  -----  ----  -----------------------------------------------------------------------  --------
40d12ae4-bd58-4980-8f85-82eaf8c05ad5  narusejun.com.      NS     null  ns-a3.conoha.io.                                                         null    
b20a3ae9-d143-4bbe-b9af-3a1b4e8b0b9d  narusejun.com.      NS     null  ns-a1.conoha.io.                                                         null    
f48079d7-4362-423c-82e9-dffd69cbea52  narusejun.com.      NS     null  ns-a2.conoha.io.                                                         null    
459c6bb0-3be6-42a5-bb07-0cd015d52ff3  narusejun.com.      A      3600  1.2.3.4                                                                  null    
dcd021fd-d7ef-4b48-bff9-88bd7a82a66a  v6.narusejun.com.   AAAA   3600  ::1                                                                      null    
ba83e0a9-f949-4abb-bc9d-256b8ede1699  narusejun.com.      MX     3600  mail.narusejun.com.                                                      10      
6978d3d5-107f-4956-9931-f14ed342ef30  narusejun.com.      SOA    null  ns-a1.conoha.io. postmaster.example.org. 1482410499 3600 600 86400 3600  null    
fbf61009-34f0-497c-adcb-db9a6742925f  www.narusejun.com.  CNAME  3600  narusejun.com.                                                           null    
```

### レコード変更
```sh
$ conoha-dns update www.narusejun.com -t CNAME -d v6.narusejun.com
id                                    name                type   ttl   data               priority
------------------------------------  ------------------  -----  ----  -----------------  --------
fbf61009-34f0-497c-adcb-db9a6742925f  www.narusejun.com.  CNAME  3600  v6.narusejun.com.  null    
```
※ 同名のレコードが複数ある場合にはIDが早いものが変更されます。
それ以外を変更する場合は「IDでのレコード指定」をしてください。

### レコード削除
```sh
$ conoha-dns remove www.narusejun.com
OK
```
※ この方法でZoneApex(`@`)を削除しようとするとドメイン自体が削除されます。
ZoneApexレコードを削除したい場合は「IDでのレコード指定」をしてください。

### IDでのレコード指定
```sh
$ conoha-dns update narusejun.com --record ba83e0a9-f949-4abb-bc9d-256b8ede1699 -t MX -d mx.narusejun.com -p 114
id                                    name            type  ttl   data               priority
------------------------------------  --------------  ----  ----  -----------------  --------
ba83e0a9-f949-4abb-bc9d-256b8ede1699  narusejun.com.  MX    3600  mx.narusejun.com.  114  

$ conoha-dns remove narusejun.com --record ba83e0a9-f949-4abb-bc9d-256b8ede1699
OK
```

### nginx設定ファイルから自動設定

nginxの設定ファイルで`server_name`に指定されているドメイン全てを自動的に設定します。
IPアドレスは`conoha-dns`を実行しているマシンのものが使われます。
自分で指定する場合は`--A 10.0.0.1`や`--AAAA ::1`のようにします。
また、`--A null`とするとIPv4アドレスを、`--AAAA null`とするとIPv6アドレスを設定しません。

```sh
$ conoha-dns nginx -f /etc/nginx/nginx.conf
add:    xn--vnuz72aq84a.com.    A       150.95.142.80
add:    xn--vnuz72aq84a.com.    AAAA    2400:8500:1302:823:150:95:142:80
add:    narusejun.com.  A       150.95.142.80
add:    narusejun.com.  AAAA    2400:8500:1302:823:150:95:142:80
```
