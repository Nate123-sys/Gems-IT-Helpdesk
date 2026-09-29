GEMS SERVICE DESK - LOCAL SERVER SETUP
========================================


WHAT CHANGED (9/29/26)
-----------------------
The current version which has improved UI and functions
has been pushed to another branch refer to https://github.com/Nate123-sys/Gems-IT-Helpdesk/tree/master


WHAT CHANGED
------------
The app used to save tickets/users only in each browser's own local
storage, so data didn't follow you between machines. It now talks to a
small Node.js server (server.js) that writes tickets and users to JSON
files on disk (in the /data folder), so everyone on the office network
shares the same data.

REQUIREMENTS
------------
Node.js installed on the PC that will host this (any recent version,
e.g. Node 18+). Check with:  node -v

FIRST-TIME SETUP
-----------------
1. Copy this whole "gems-service-desk" folder onto the host PC
   (e.g. a spare desktop or a server machine in the office).
2. Open a terminal / Command Prompt in that folder.
3. Run:
       npm install
   (this downloads the one dependency, Express, and only needs to be
   done once).

RUNNING IT
----------
   npm start
   -- or --
   node server.js

You'll see:
   GEMS Service Desk is running.
     On this PC:      http://localhost:8080
     From other PCs:  http://<this-PC-LAN-IP>:8080

- On the host PC itself, open http://localhost:8080
- On any other PC in the same office network, open
  http://<host-PC's-LAN-IP>:8080  (find the IP with `ipconfig` on
  Windows or `ip addr` on Linux, e.g. 192.168.1.50).

This is LAN-only: the server binds to the machine's local network
interface, so it's reachable by anyone on the same office Wi-Fi/LAN,
but NOT from the internet, unless someone opens port 8080 on the
router/firewall for it -- don't do that unless you specifically want
external access, since there's no login-rate-limiting or HTTPS here.

WHERE DATA LIVES
-----------------
- ./data/gems-helpdesk-tickets-v1.json  -- all tickets
- ./data/gems-helpdesk-users-v1.json    -- department login accounts
Back these two files up (or the whole /data folder) as part of your
regular file backups -- that's the entire database.

KEEPING IT RUNNING
-------------------
For day-to-day office use you'll want this running in the background
and restarting if the PC reboots. Two common options:

1. Windows: use NSSM (Non-Sucking Service Manager) or Task Scheduler
   ("run at startup", action = `node server.js` in this folder) to
   run it as a background service.
2. Linux server: use pm2 (`npm i -g pm2; pm2 start server.js; pm2 save;
   pm2 startup`) or a systemd unit.

CHANGING THE PORT
-------------------
If 8080 is taken by something else, run it on another port instead:
   PORT=8081 node server.js        (Linux/Mac)
   set PORT=8081 && node server.js (Windows cmd)

NOTES
-----
- Seed department accounts (sales/sales123, hr/hr123, etc.) are only
  created the very first time the server runs with no users.json yet.
  Change these passwords right away from the in-app "User management"
  screen (IT (Admin) login: it.admin / P@ssw0rd01) -- change that one
  too.
- The front end still falls back to the browser's own localStorage if
  it can't reach the server (e.g. server briefly restarting), so the
  UI won't break, but that fallback data stays local to that one
  browser until the server is reachable again.
