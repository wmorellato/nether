# Nether

Nether is a Minecraft server manager integrated with Amazon EC2. I built this project to learn Node.js and AWS while, at the same time, providing an easy way for me and my friends to manage our server without relying on private hosting solutions.

This project is still in a **really** early state, with only basic functionalities like starting, stopping instances and servers and a simple integration with Discord to notify about changes on servers and instances.

You **will** need (at least for now) basic knowledge on EC2 (how to create an instance, how to generate keypairs, how to add a new admin user to manage instances etc), but it should be a good and cheaper alternative to hosting.

Hope you enjoy.

## TODO

 - Create a decent documentation
 - Integrate this project with a frontend. Now it is only an API.
 - Manage server files (change server icon, jars, add/remove worlds).
 - Automate steps to create an instance and configure it to host a server (this is somewhat complex).
 - Integrate with S3 for backups, Cloudwatch and other services.

## Changelog

### [0.1.0] - 2020-02-01

#### Added:

- Jar upgrade
    - If the client does not specify a jar url, Nether will download the latest available version from Paper.
    - For now I don't delete the old jar, just replace the jar name in `start.sh` script.
    - Helper functions to get the latest version from Paper that can be expanded for other flavors.

#### Modified:

- `start.sh`
    - It is easier to replace the jars if the environment variables for the jar name is in `start.sh`.
    - I also moved the env variables `XMS` and `XMX` for the future when the client needs to modify the memory allocation.

### [0.0.1] - 2019-12-14

First version.

#### Added
- Start, stop reboot instances through the API
- Start, stop, restart Minecraft servers through the API
- Basic Minecraft server monitoring (can be used for events)
- Discord integration for notifications
