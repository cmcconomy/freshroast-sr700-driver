# freshroast-sr700-driver
FreshRoast SR700 serial-over-USB driver.

## Building
Note that it's *critical* to use a modern version of node such as 6.9+, or else the npm install of the dependency 'serialport' will fail.

## Communication Loop
Packets sent from Computer -> Roaster must be at least 250ms apart.

```
     ┌──────┐              ┌─────┐
     │driver│              │SR700│
     └──┬───┘              └──┬──┘
        │         init        │   
        │ ────────────────────>   
        │                     │   
        │ recipe line 0..(n-1)│   
        │ <─ ─ ─ ─ ─ ─ ─ ─ ─ ─    
        │                     │   
        │    recipe line n    │   
        │ <─ ─ ─ ─ ─ ─ ─ ─ ─ ─    
        │                     │   
        │       setState      │   
        │ ────────────────────>   
        │                     │   
        │      currState      │   
        │ <─ ─ ─ ─ ─ ─ ─ ─ ─ ─    
     ┌──┴───┐              ┌──┴──┐
     │driver│              │SR700│
     └──────┘              └─────┘
```

## PID research (for later)
some PID controllers to consider: 
* pid-controller (code looks more sophisticated)
* node-pid-controller
* liquid-pid

PID Tuning advice: http://robotics.stackexchange.com/questions/167/what-are-good-strategies-for-tuning-pid-loops

