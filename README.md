ScrumPoker
==========

This is a small application that allows distributed agile teams to play planning poker remotely.

The Scrum Master can initiate voting on a Backlog or Story, meanwhile each member can vote on the current item. When all votes are in the Scrum Master can reveal the votes and log a final vote value.

All communication occurs in real time using socket.io

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

Screenshot
----------
![](http://planningpoker.io/images/results.png)
