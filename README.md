# freshroast-sr700
FreshRoast SR700 serial-over-USB driver

## Building
Note that it's *critical* to use a modern version of node such as 6.9+, or else the npm install of the dependency 'serialport' will fail.

some PID controllers to consider: 
* node-pid-controller
* pid-controller
* liquid-pid

## Communication Model
```
+----------+          +-------+
| Computer |          | SR700 |
+----------+          +-------+
     |                    |
     |-------(init)------>|
     |                    |
     |<-----(recipe)------|
     |                    |
     |-----(set state)--->|
     |                    |
     |<--(report state)---|
     |                    |
     |                    |
```
