trade-dashboard
===============

A trading dashboard for the GMs in the OCUA Parity League. The dashboard lets you see the current salary distribution of your team, whether you are over or under cap and lets you make trades and see their affect.

running at: [https://trade-dashboard.5apps.com/](https://trade-dashboard.5apps.com/)

### Screenshot:
![screenshot](https://raw.githubusercontent.com/pickle27/ocua-parity-league/master/trade-dashboard/screenshot.png)

Building:
---------

Run:

```
coffee -bcw *.coffee
```

In the project directory and everytime the coffee file is saved it will be compiled into js.


Running locally:
----------------
```
python -m SimpleHTTPServer 8000
```

Then the app is available at localhost:8000/index.html
