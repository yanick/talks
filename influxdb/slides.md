---
title:  InfluxDB
author: Yanick Champoux yanick.champoux@iinteractive.com
separator: '>>>'
verticalSeparator: vvv
---

#! [InfluxDB](http://influxdata.com/)

Yanick Champoux 

[yanick.champoux@iinteractive.com](mailto:yanick.champoux@iinteractive.com)

twitter: [@yenzie](https://twitter.com/yenzie)

# Disclaimer

![I have no idea what I'm doing](public/no_idea.jpg)

## Let's play with time-series databases!

##^ Time-series database?

##v A regular database has dimensions

they are all created equal


| timestamp | disk_name | percent_used |
|-----------|-----------|--------------|
| 12200 | /dev/hda1 | 0.8
| 12345 | /dev/hda1 | 0.9

##^  time-series dbs are the same

| &#9733; timestamp &#9733; | disk_name | percent_used |
|-----------|-----------|--------------|
| &#9733; 12200 &#9733; | /dev/hda1 | 0.8
| &#9733; 12345 | /dev/hda1 | 0.9

time dimension is just **much** more equal than the others

##^ benefits

* timestamps everywhere
* Get last value of series
* group by time
* time-based transformations (mean, variance, min/max, etc)
* time-based data granularity


##^ what are we going to do?

set up a monitoring system!

* email backlog
* printer ink level

#^ why?

![because it's fun](public/its_fun.gif)

## why [InfluxDB](http://influxdata.com/)?

* Small footprint
* Easy to install
* Simple, clean, intuitive API

## specs

* Written in Go
* Backend
    * v0.8 --> LevelDB, RocksDB, HyperLevelDB, and LMDB
    * v0.9 --> BoltDB
    * v.11+ --> Time Structured Merge Tree storage engine

## There's TICK stack, though!

![The Tick](public/TheTick.png)

#^

| &nbsp; | &nbsp; |  &nbsp; | 
| --- | --- |---: |
|T | elegraf | *data gathering agent*
|I| nfluxDB | *database*
|C| hronograf | *UI*
|K| apacitor| *Alerting agent*

# InfluxDB

## Installation

    $ wget https://dl.influxdata.com/influxdb/releases/
                influxdb-1.1.1_linux_amd64.tar.gz

    $ tar --strip-components=2 \
        -C instance            \
        -zxf SRC/influxdb-1.1.1_linux_amd64.tar.gz

## `etc/influxdb`

    [meta]
        dir = "./var/lib/influxdb/meta"

    [data]
        dir     = "./var/lib/influxdb/data"
        wal-dir = "./var/lib/influxdb/wal"

#^

```
$ ./usr/bin/influxd run -config etc/influxdb/influxdb.conf 

    [snip logo]

[run] 2017/01/19 19:34:26 InfluxDB starting, version 1.1.1, branch master, commit e47cf1f2e83a02443d7115c54f838be8ee959644
[run] 2017/01/19 19:34:26 Go version go1.7.4, GOMAXPROCS set to 4
[run] 2017/01/19 19:34:26 Using configuration at: etc/influxdb/influxdb.conf
[store] 2017/01/19 19:34:26 Using data dir: ./var/lib/influxdb/data
[cacheloader] 2017/01/19 19:34:26 reading file var/lib/influxdb/wal/_internal/monitor/1/_00001.wal, size 2939
[cacheloader] 2017/01/19 19:34:26 reading file var/lib/influxdb/wal/_internal/monitor/1/_00002.wal, size 8260
[cacheloader] 2017/01/19 19:34:26 reading file var/lib/influxdb/wal/_internal/monitor/1/_00004.wal, size 2006
[cacheloader] 2017/01/19 19:34:26 reading file var/lib/influxdb/wal/_internal/monitor/1/_00005.wal, size 0
```

## the `influx` cli 

    $ ./usr/bin/influx --precision rfc3339
    Visit https://enterprise.influxdata.com to register for updates,
        InfluxDB server management, and monitoring.
    Connected to http://localhost:8086 version 1.1.1
    InfluxDB shell version: 1.1.1
    >

#v 

* Time recorded in nanoseconds

* All times are UTC-based

![Thank you so much](public/thank_you.jpg)


## create a db   

    > create database example

    > show databases
    name: databases
    name
    ----
    _internal
    example

## insert data  

    > use example

    > insert printer_ink,printer=nibada,color=black remaining=0.20

##v entries

    <measurement><tags> <fields> <time>
      |            |       
      `-- table    `-- indexed columns

#^

```
insert email_backlog,address=yanick@babyl.ca,mailbox=inbox \
    total=1234,new=60,old=1174
```

#^

* de-facto schema
* fields and tags can go missing
* types: strings, integers, floats, booleans
* series: measurement+distinct tags

# 

    > select * from printer_ink
    name: printer_ink
    time  color   printer remaining
    ----  -----   ------- ---------
    2017-01-23T00:24:39.134920825Z     black   nibada  0.2
    2017-01-23T00:24:39.134920825Z     cyan    nibada  0.3

##^ Selecting stuff

    > select *               from "printer_ink"

    > select "level","color" from "printer_ink"

    > select *::field        from "printer_ink"

    > select "remaining"::field from "printer_ink"

    > select /_remaining/    from "printer_ink"

Note:  Must select at least one field Identifiers must be double quoted if they contain characters other than [A-z,0-9,_]

##^ Arithmetic

```
     # yup
> select max(100*level) as percent from printer_ink group by color

     # nope
> select mean(old+new) from email_backlog group by address
```

##^ Where

    > select from "printer_ink" where "printer"="nibada"
    >

##^ Oooops

"foo" is a field, 'foo' is a string

    > select from "printer_ink" where "printer"='nibada'

##^ Where with time

    > select from "printer_ink" where time > now() - 7d

## Group by

    > select *::field from printer_ink group by color
    name: printer_ink
    tags: color=black
    time                    black   level 
    ----                    -----   ----- 
    2017-01-22T20:10:38Z            0.4   
    2017-01-22T20:12:18Z            0.38  
    2017-01-22T20:12:28Z            0.34  

    name: printer_ink
    tags: color=cyan
    time                    black   level
    ----                    -----   -----
    2017-01-22T20:10:38Z            0.55 
    2017-01-22T20:12:18Z            0.55 
    2017-01-22T20:12:28Z            0.48 

## Group by time

needs `where`

```
> select *::field from printer_ink 
    group by color,time(3h)
    where time > now() - 1d
```

#^

    > select * from printer_ink group by *
    name: printer_ink
    tags: color=black, printer=nibada
    time                    black   level
    ----                    -----   -----
    2017-01-22T20:10:38Z            0.4
    2017-01-22T20:12:18Z            0.38
    2017-01-22T20:12:28Z            0.34


##^ limit / offset

    > select * from "printer_ink" limit 1

##^ slimit / soffset

    > select *::field from printer_ink group by color slimit 1
    name: printer_ink
    tags: color=black
    time                    black   level 
    ----                    -----   ----- 
    2017-01-22T20:10:38Z            0.4   
    2017-01-22T20:12:18Z            0.38  
    2017-01-22T20:12:28Z            0.34  

### Order by

## fill - null

    > select min(level) from printer_ink 
        where time > '2017-01-19' 
        group by time(1d) 
        fill(null)

    name: printer_ink
    time                    min
    ----                    ---
    2017-01-19T00:00:00Z
    2017-01-20T00:00:00Z    0.8
    2017-01-21T00:00:00Z
    2017-01-22T00:00:00Z    0.34
    2017-01-23T00:00:00Z


##^ fill - none

    > select min(level) from printer_ink
        where time > '2017-01-19'
        group by time(1d)
        fill(none)

    name: printer_ink
    time                    min
    ----                    ---
    2017-01-20T00:00:00Z    0.8
    2017-01-22T00:00:00Z    0.34

##^ fill - constant

    > select min(level) from printer_ink
        where time > '2017-01-19'
        group by time(1d)
        fill(1)

    name: printer_ink
    time                    min
    ----                    ---
    2017-01-19T00:00:00Z    1
    2017-01-20T00:00:00Z    0.8
    2017-01-21T00:00:00Z    1
    2017-01-22T00:00:00Z    0.34
    2017-01-23T00:00:00Z    1


##^ fill - previous

    > select min(level) from printer_ink
        where time > '2017-01-19'
        group by time(1d)
        fill(previous)

    name: printer_ink
    time                    min
    ----                    ---
    2017-01-19T00:00:00Z
    2017-01-20T00:00:00Z    0.8
    2017-01-21T00:00:00Z    0.8
    2017-01-22T00:00:00Z    0.34
    2017-01-23T00:00:00Z    0.34


##^ fill - linear

    > select min(level) from autogen.printer_ink 
            where time > '2017-01-19'
            group by time(1d) fill(linear)
    name: printer_ink
    time                    min
    ----                    ---
    2017-01-19T00:00:00Z
    2017-01-20T00:00:00Z    0.8
    2017-01-21T00:00:00Z    0.5700000000000001
    2017-01-22T00:00:00Z    0.34
    2017-01-23T00:00:00Z

##^ SELECT INTO

    > select level into my_printer
        from printer_ink 
        group by color

##^ Regex

    > select /a/ from /^p/ where printer =~ /^n/
    name: printer_ink
    time                    black   cyan    magenta
    ----                    -----   ----    -------
    2017-01-20T00:46:22Z    0.5     0.9     0.8

## Functions

    | Aggregations | Selectors    | Transformations           | Predictors     |
    |--------------+--------------+---------------------------+----------------|
    | COUNT()      | BOTTOM()     | CEILING()                 | HOLT_WINTERS() |
    | DISTINCT()   | FIRST()      | CUMULATIVE_SUM()          |                |
    | INTEGRAL()   | LAST()       | DERIVATIVE()              |                |
    | MEAN()       | MAX()        | DIFFERENCE()              |                |
    | MEDIAN()     | MIN()        | ELAPSED()                 |                |
    | MODE()       | PERCENTILE() | FLOOR()                   |                |
    | SPREAD()     | SAMPLE()     | HISTOGRAM()               |                |
    | STDDEV()     | TOP()        | MOVING_AVERAGE()          |                |
    | SUM()        |              | NON_NEGATIVE_DERIVATIVE() |                |

## Retention policies

    <measurement>

    <database>..<measurement>

    <database>.<retention policy>.<measurement>

##v

    CREATE RETENTION POLICY "two_weeks"
     ON "example" 
     DURATION 2w 
     REPLICATION 1 
     DEFAULT

Note: INF for forever

##v Aggregate old data

* `example.two_weeks.printer_ink` - keep it all for 2 weeks
* `archive.autogen.printer_ink` - after that, just keep weekly average

## Continuous Query

```
CREATE CONTINUOUS QUERY "archive_printer" ON "telegraf"
BEGIN 
  SELECT mean(*)
    INTO "telegraf"."forever"."archived_printer" 
    FROM "telegraf"."two_weeks"."printer_ink" 
    GROUP BY *,time(7d) 
END
```

##^ meta-query

```
CREATE CONTINUOUS QUERY "archive_all_the_things" ON "telegraf"
BEGIN
  SELECT mean(*)
    INTO "archive"."autogen".:MEASUREMENT
    FROM /.*/
  GROUP BY * time(7d) 
END
```


## HTTP API

##^ Create  db

    curl -i -XPOST http://localhost:8086/query
        --data-urlencode "q=CREATE DATABASE mydb"

##^ Write data
 
    curl -i -XPOST 'http://localhost:8086/write?db=mydb'
        --data-binary 'printer_ink,printer=nabada,color=black level=0.2'

    curl -i -XPOST 'http://localhost:8086/write?db=mydb' 
        --data-binary @cpu_data.txt

##^ Queries

    $ http -f post http://localhost:8086/query db==telegraf 
        q="select * from printer_ink limit 1"

    HTTP/1.1 200 OK
    Connection: close
    Content-Encoding: gzip
    Content-Type: application/json
    Date: Fri, 20 Jan 2017 01:25:29 GMT
    Request-Id: 53f42ce3-deaf-11e6-8051-000000000000
    Transfer-Encoding: chunked
    X-Influxdb-Version: 1.1.1

    { "results": 
    [ { "series":
        [ { "columns": 
        [ "time", "black", "cyan", "magenta", "printer", "yellow" ], 
        "name": "printer_ink", 
        "values": [ 
        [ "1970-01-01T00:00:00.000000012Z", 0.5, 0.8, 0.8, "nibada", 0.4 ] 
        ] 
    } ] } ] }

## Other inputs

* UDP
* Graphite
* CollectD
* OpenTSDB

## [web UI](http://localhost:8083)

Deprecated and pretty basic

* Enter data
* Run queries

## Authentication

Via Basic Auth

    curl -G "http://localhost:8086/query?u=todd&p=influxdb4ever"
        --data-urlencode "q=SHOW DATABASES"

    curl -G http://localhost:8086/query
        -u todd:influxdb4ever
        --data-urlencode "q=SHOW DATABASES"

    curl -G http://localhost:8086/query
        --data-urlencode "u=todd"
        --data-urlencode "p=influxdb4ever"
        --data-urlencode "q=SHOW DATABASES"



## Authorization

pretty basic

*  admin
*  non-admin
    *    read / write / all
    *    per-database

## Big Data-y stuff

* Replication
* High Availability

##^ Relay


            ┌─────────────────┐                 
            │writes & queries │                 
            └─────────────────┘                 
                    │                          
             ┌───────────────┐                  
    ┌────────│ Load Balancer │─────────┐        
    │        └──────┬─┬──────┘         │        
    │        ┌──────┘ └────────┐       │        
    │        │ ┌─────────────┐ │       │┌──────┐
    │        │ │/write or UDP│ │       ││/query│
    │        ▼ └─────────────┘ ▼       │└──────┘
    │  ┌──────────┐      ┌──────────┐  │        
    │  │ Relay    │      │ Relay    │  │        
    │  └──┬────┬──┘      └────┬──┬──┘  │        
    │     |  ┌─┼──────────────┘  |     │        
    │     │  │ └──────────────┐  │     │        
    │  ┌──────────┐      ┌──────────┐  │        
    └─▶│ InfluxDB │      │ InfluxDB │◀─┘        
       └──────────┘      └──────────┘   



## Telegraf

![Switchboard](public/Phone-Switchboard.jpg)

## Installation

    $ wget https://dl.influxdata.com/telegraf
                /releases/telegraf-1.0.1_linux_amd64.tar.g

    $ tar -zxf telegraf*

##^

    $ ./usr/bin/telegraf -config etc/telegraf/telegraf.conf
    2017/01/23 19:08:33 Attempting connection to output: influxdb
    2017/01/23 19:08:33 Successfully connected to output: influxdb
    2017/01/23 19:08:33 Starting Telegraf (version 1.0.1)
    2017/01/23 19:08:33 Loaded outputs: influxdb
    2017/01/23 19:08:33 Loaded inputs: exec
    2017/01/23 19:08:33 Tags enabled: host=enkidu
    2017/01/23 19:08:33 Agent Config: Interval:6h0m0s, Debug:true, Quiet:false, Hostname:"enkidu", Flush Interval:10s
    2017/01/23 19:08:33 ERROR in input [exec]: Errors encountered: [exec: fork/exec ../../oculi/bin/oculi: no such file or directory for command '../../oculi/bin/oculi printer_ink --printer nibada --address 192.168.0.120']
    2017/01/23 19:08:33 Input [exec] gathered metrics, (6h0m0s interval) in 7.935048ms
    2017/01/23 19:08:43 Output [influxdb] buffer fullness: 0 / 10000 metrics. Total gathered metrics: 0. Total dropped metrics: 0.
    2017/01/23 19:08:53 Output [influxdb] buffer fullness: 0 / 10000 metrics. Total gathered metrics: 0. Total dropped metrics: 0.

## It's all plugins

* Input
* Output
* Aggregator
* Processor

## `telegraf.conf` - agent

    [agent]
    interval            = "10s"
    round_interval      = true
    metric_batch_size   = 1000
    metric_buffer_limit = 10000
    collection_jitter   = "0s"
    flush_interval      = "10s"
    flush_jitter        = "0s"
    precision           = ""
    debug               = false
    quiet               = false
    hostname            = ""
    omit_hostname       = false

##^ `telegraf.conf` - outputs

    [[outputs.influxdb]]
    urls              = ["http://localhost:8086"]
    database          = "telegraf"
    retention_policy  = ""
    write_consistency = "any"
    timeout           = "5s"

##^ `telegraf.conf` - inputs

    [[inputs.cpu]]
    percpu    = true
    totalcpu  = true
    fielddrop = ["time_*"]

    [[inputs.disk]]
    ignore_fs = ["tmpfs", "devtmpfs"]

    [[inputs.diskio]]
    [[inputs.kernel]]
    [[inputs.mem]]
    [[inputs.processes]]
    [[inputs.swap]]
    [[inputs.system]]


## Plugins - input

|               |              |             |             | 
| -----------   | ------------ | ----------- | --------    | 
| AWS           | CloudWatch   | Aerospike   | Apache      | 
| Cassandra     | Ceph         | cgroup      | Chrony      | 
| Conntrack     | Couchbase    | CouchDB     | Disque      | 
| query         | time         | Docker      | Dovecot     | 
| Exec          | Filestat     | Graylog     | HAproxy     | 
| HTTP_response | HTTPJSON     | InfluxDB    | IPMI_sensor | 


##^ Plugins - input

|             |              |             |             
| ----------- | ------------ | ----------- | --------    
| Jolokia     | Kubernetes   | Leofs       | Lustre2     
| Memcached   | Mesos        | MongoDB     | mySQL       
| nginx       | NSQ          | Nstat       | NTPq        
| Phusion     | Passenger    | Ping        | PostgreSQL  
| PowerDNS    | Procstat     | Prometheus  | Puppetagent 
| Raindrops   | Redis        | rethinkDB   | Riak        
| SNMP        | SNMP_legacy  | SQL         | server      
| Twemproxy   | Varnish      | ZFS         | Zookeeper   
| Sysstat     | System


##^ Plugins - input

|                       |               |
| --------              | --------      |
| Mailchimp             | Bcache        |
| Net_response          | Consul        |
| PHP                   | DNS           |
| PostgreSQL_extensible | Elasticsearch |
| RabbitMQ              | Hddtemp
| Sensors               | IPtables
| Trig | Win_perf_counters
| FPM



##^ Plugins - input services

|      |           |          |
| --   | --        | --       |
| HTTP | Kafka     | MQTT     | NATS
| NSQ  | Logparser | StatsD   | Tail
| TCP  | UDP       | Webhooks |

##^ when all else fail

    [[inputs.exec]]
    commands= [ "../../oculi/bin/oculi printer_ink 
            --printer nibada --address 192.168.0.120" ]

    tagexclude = ["host"]
    data_format = "influx"


##^ Plugins - output 

|      |           |          |
| --   | --        | --       |
|InfluxDB|amon|AMQP|AWS|
|Kinesis|AWS|CloudWatch|Datadog|
|File|Graphite|Graylog|Instrumental|
|Kafka|Librato|MQTT|NATS|
|NSQ|OpenTSDB|Prometheus|Riemann

## testing

    $ telegraf --test --input-filter exec --config ...

# Chronograf

## Installation

    $ wget https://dl.influxdata.com/chronograf
                /releases/chronograf-1.1.0~beta6_linux_amd64.tar.gz

    $ tar --strip-components=2 
            -C instance 
            -zxf SRC/chronograf-1.1.0~beta6_linux_amd64.tar.gz

## Meh

* Default graphs tuned to Telegraf's defaults
* Kinda integrate with Kapacitor

# Grafana

## Installation

    $ wget https://grafanarel.s3.amazonaws.com/builds
                /grafana-4.1.1-1484211277.linux-x64.tar.gz

    $ tar --strip-components=1 -C instance/grafana/ \
            -zxf SRC/grafana-4.1.1-1484211277.linux-x64.tar.gz

#  

```
$ ./bin/grafana-server
INFO[01-26|17:09:58] Starting Grafana
INFO[01-26|17:09:58] Config loaded from
INFO[01-26|17:09:58] Path Home
```

# Kapacitor

<img width="400px" alt="Now panic and freak out" src="panic.jpg" />

## Installation

    $ wget https://dl.influxdata.com/kapacitor/releases/kapacitor-1.1.1_linux_amd64.tar.gz

    $ tar --strip-components=2 -C instance/ \
            -zxf SRC/kapacitor-1.1.1_linux_amd64.tar.gz

##   

```
$ ./usr/bin/kapacitord --config ./etc/kapacitor/kapacitor.conf

2017/01/22 15:48:59 Using configuration at: ./etc/kapacitor/kapacitor.conf
```

#   [TICKscript](https://docs.influxdata.com/kapacitor/v1.1/tick/)

## notifications   

| | | | | |
|---|---|---|---|---|
|    log  |    post |     tcp|       email  |exec  |
|    HipChat |  Alerta |   Sensu  |   Slack | SNMPTraps |
|    OpsGenie |  VictorOps | PagerDuty | Talk | Telegram |


## Two types of scripts

* stream 
* batch

## stream

    stream
      |from()
        .measurement('printer_ink')
      |groupBy('color', 'printer')
      |alert()
        .id('{{ .Name }}/{{ index .Tags "color"}}')
        .message(
          'printer ink running low {{ index .Tags "color" }}'
        )
        .warn(lambda: "level" < 0.25 )
        .warnReset( lambda: "level" > 0.9 )
        .log('/tmp/alerts.log')
##v

```
var printer_stream = stream
  |from()
    .measurement('printer_ink')
  |groupBy('color', 'printer')

printer_stream 
  | alert().id(...).warn(...).email( ... )

printer_stream 
  | alert().id(...).warn(...).slack( ... )
```

## batch

    batch
        |query('''
            select last(level) from telegraf.autogen.printer_ink
        ''')
            .every(6h)  // running interval
            .period(6h) // will gather data for that span
            .groupBy(time(6h),'printer','color')
        |alert()
            .id('{{ .Name }}/{{ index .Tags "printer" }}/{{ index .Tags "color"}}')
            .message('printer ink is running low {{ index .Tags "color" }} {{ index .Fields "level"}}')
            .crit(lambda: "last" < 0.05 )
            .email('yanick@babyl.ca')

##^ create the task

```
$ ./usr/bin/kapacitor define ink_alert
  -type stream
  -tick ../printer.tick
  -dbrp telegraf.autogen
```

##^ enable it

    $ ./usr/bin/kapacitor enable ink_alert

##^ see it

```
$ ./usr/bin/Kapacitor show ink_alert

ID: ink_alert
Error: 
Template: 
Type: stream
Status: enabled
Executing: true
Created: 27 Jan 17 17:16 EST
Modified: 27 Jan 17 17:47 EST
LastEnabled: 27 Jan 17 17:47 EST
Databases Retention Policies: ["telegraf"."autogen"]
```

##v see it, cont'd

```
TICKscript:
var printer_stream = stream
  |from()
    .measurement('printer_ink')
  |groupBy('color', 'printer')

printer_stream
  |alert()
    .id('{{ .Name }}/{{ index .Tags "printer" }}/{{ index .Tags "color"}}')
    .message('printer ink is running low {{ index .Tags "color" }} {{ index .Fields "level"}}')
    .warn(lambda: "level" < 0.25)
    .warnReset(lambda: "level" > 0.9)
    .log('/tmp/alerts.log')

printer_stream
  |alert()
    .id('{{ .Name }}/{{ index .Tags "printer" }}/{{ index .Tags "color"}}')
    .message('printer ink is running low {{ index .Tags "color" }} {{ index .Fields "level"}}')
    .crit(lambda: "level" < 0.05)
    .email('yanick@babyl.ca')
```

##v see it, cont'd

```
DOT:
digraph ink_alert {
graph [throughput="0.00 points/s"];

stream0 [avg_exec_time_ns="0s" ];
stream0 -> from1 [processed="4"];

from1 [avg_exec_time_ns="0s" ];
from1 -> groupby2 [processed="4"];

groupby2 [avg_exec_time_ns="0s" ];
groupby2 -> alert4 [processed="4"];
groupby2 -> alert3 [processed="4"];

alert4 [alerts_triggered="1" avg_exec_time_ns="2.458µs" crits_triggered="1" infos_triggered="0" oks_triggered="0" warns_triggered="0" ];

alert3 [alerts_triggered="2" avg_exec_time_ns="979.084µs" crits_triggered="0" infos_triggered="0" oks_triggered="0" warns_triggered="2" ];
}
```

##v [dot](public/ink.svg)

```
$ ./usr/bin/kapacitor show ink_alert 
  | grep DOT -A 100 
  | tail -n +2  
  | dot -Tsvg > ../public/ink.svg
```






## deadman's switch

    printer_stream 
      // less than 2 observations in 7 days
      | deadman( 2.0, 7d )
          .email('yanick@babyl.ca')

    

## topic

    printer_stream
        |alert()
            .id('{{ .Name }}/{{ index .Tags "printer" }}/{{ index .Tags "color"}}')
            .message('printer ink is running low {{ index .Tags "color" }} {{ index .Fields "level"}}')
            .crit(lambda: "level" < 0.05)
            .topic('yell')

##^ `yeller.yml`

    id: yeller

    topics:
    - yell

    actions:
    - kind: email
        options:
          to: 'yanick@babyl.ca'


##^

    $ usr/bin/kapacitor define-handler yeller.yml


## recordings

    $ usr/bin/kapacitor record stream -task ink_alert -duration 20s
    > a5ed769a-b06f-4db9-8bc9-34fba78ff86c

##^ list'em
    
```
$ usr/bin/kapacitor list recordings a5ed769a-b06f-4db9-8bc9-34fba78ff86c
ID                 Type    Status    Size      Date
a5ed769a-...-ff86c stream  finished  135 B     27 Jan 17 18:09 EST
```

##^ replay

```
$ usr/bin/kapacitor replay
  -recording a5ed769a-b06f-4db9-8bc9-34fba78ff86c
  -task ink_alert
0dd61fda-b1d0-4d6c-a7a5-5f0663911975
```



## All downloads

https://www.influxdata.com/downloads/
