# freshroast-sr700-driver
FreshRoast SR700 serial-over-USB driver.

## Building
Note that it's *critical* to use a modern version of node such as 6.9+, or else the npm install of the dependency 'serialport' will fail.

## Communication Loop
Packets sent from Computer -> Roaster is observed 500ms apart in the windows app. Openroast suggests they should be at precisely 250ms apart.

```
     ┌──────┐              ┌─────┐
     │driver│              │SR700│
     └──┬───┘              └──┬──┘
        │         init        │   
        │ ────────────────────>   
        │                     │   .
        │ recipe line 0..(n-1)│    |
        │ <─ ─ ─ ─ ─ ─ ─ ─ ─ ─      \ I ignore these recipes lines and just
        │                     │     / start hammering the setState packets
        │    recipe line n    │    |
        │ <─ ─ ─ ─ ─ ─ ─ ─ ─ ─    .
        │                     │   
        │       setState      │   
        │ ────────────────────>   
        │                     │   
        │      currState      │   
        │ <─ ─ ─ ─ ─ ─ ─ ─ ─ ─    (repeat set/get ad nauseum)
     ┌──┴───┐              ┌──┴──┐
     │driver│              │SR700│
     └──────┘              └─────┘
```

## PID research

### PID Tuning advice  
- http://robotics.stackexchange.com/questions/167/what-are-good-strategies-for-tuning-pid-loops
- https://www.reddit.com/r/Multicopter/comments/30m55r/am_i_blind_cant_find_a_single_decent_guide_to_pid/?st=iyax14o9&sh=a3b489a4


