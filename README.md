ScrumPoker
==========

Node.js app for distributed Scrum Poker sessions. Scrum Master can begin the vote at which point team members can cast their votes.
Votes remain hidden until the scrum master reveals the results.

Demo
----
Create a voting room at: http://planningpoker.io
Invite voters to the url provided on the scrum master page.


Setup
-----
Install dependent modules (from ./server)

    npm install

Run Server

    node index.js

ScrumMaster
-----------
Open http://localhost:3000/scrummaster/{planningRoom}

Team Members
------------
Open http://localhost:3000/vote/{planningRoom}

