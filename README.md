ScrumPoker
==========

Node.js app for distributed Scrum Poker sessions. Scrum Master can begin the vote at which point team members can cast their votes.
Votes remain hidden until the scrum master reveals the results.

Demo
----
Create a voting room at: http://planningpoker.io
Invite voters to the url provided on the scrum master page.

For a demo running with a Backlog Provider (with mock data) go to http://planningpoker.io/scrummaster/TeamRoom
A VersionOne backlog provider is available here https://github.com/PerterB/VersionOneBacklogProvider


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

Running Unit Tests
------------------
Unit Tests are run with karma

    npm install -g karma

From the public/scripts directory run

    ./test.sh


