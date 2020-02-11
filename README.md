# Nether

Nether is a Minecraft server manager integrated with Amazon EC2. I built this project to learn Node.js and AWS while, at the same time, providing an easy way for me and my friends to manage our server without relying on private hosting solutions.

This project is still in a **really** early state, with only basic functionalities like starting, stopping instances and servers and a simple integration with Discord to notify about changes on servers and instances.

You **will** need (at least for now) basic knowledge on EC2 (how to create an instance, how to generate keypairs, how to add a new admin user to manage instances etc), but it should be a good and cheaper alternative to hosting.

Hope you enjoy.

# Getting Started

You'll need some basic knowledge and practice with Node.js and AWS to setup this project.

## Requirements

- [Node.js](https://nodejs.org/en/download/)
- An AWS account. [Check this tutorial](https://aws.amazon.com/pt/premiumsupport/knowledge-center/create-and-activate-aws-account/)
    - [Create an Administrator IAM User an Group](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html). Read the corresponding section carefully and follow the instructions
    - [Create an Access Key](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) to the user you just created. Read the section *Managing Access Keys (Console)*. **Store this key carefully in a safe place and do not share it in any circumstances with anyone.** We will use it to access AWS services.
- Setup a MongoDB database
    - You can setup a local database. [Here](https://docs.mongodb.com/manual/installation/)'s how. You can download the portable version
    - Or you can create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/lp/general/try)

If you're not familiar with Node.js or AWS services, this may not be so simple. If you find these instructions hard to follow, send me a message and I'll try to explain it all with more details. Alright, let's put the service on.

## Setup the project

* Clone this repository or download it as .zip and navigate to the chosen folder.

```
cd nether
```

* Go to the root of the directory and run `npm run start` to run Nether. The console should display a message saying the server is running on port xxxx.
    * If you got any errors related to npm or Node.js, make sure you installed it.
* Hit <kbd>CTRL</kbd>+<kbd>C</kbd> to stop the server. Now we will configure the accounts.
* Open up the file `config/dev.env`. You should see the contents below

```
# runtime
DEBUG=app,routes:*,aws:*,minecraft:*,discord:*

# config
JWT_SECRET=Yja5eddkQw6qSMmEm8BYAVERYLONGSTRINGFOSEGGZ1C16VK4Ui728JLcjrRJCMU

# discord
BOT_KEY=FAKEQXIWJ7gektYAYakFsHFn.PoTaT0.4j9PQvlCa9tmcPhe0toQFAKE

# aws
AWS_REGION=sa-east-1
AWS_USER=aws-admin
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# db connections
MONGODB_CONNECTION_URL=mongodb://127.0.0.1:27017/nether
SSHKEY_ENCRYPTION_KEY=HqW9cXBpmoi2xJHyasuDontEvenTry8)
```
* You can ignore `BOT_KEY` for now. It is used to integrate Nether with Discord.
* **Do every single step below**:
    1. Modify `JWT_SECRET` to some random value. Any sequence of any characters is allowed. The bigger, the better. Heh.
    2. `AWS_REGION` will hold the region of our EC2 instance (more on this later). Leave it for now.
    3. Modify the value of `AWS_ACCESS_KEY_ID` to the access key ID you created on the Requirements session above.
    4. Modify the value of `AWS_SECRET_ACCESS_KEY` to the access key you created on the Requirements session above.
    5. For `MONGODB_CONNECTION_URL` you must put either the URL you got from MondoDB Atlas or `localhost`. __You have to start MongoDB service if you're running on your machine__.
    6. Finally, `SSHKEY_ENCRYPTION_KEY` is the key to encrypt your SSH key used to connect remotely to your EC2 instance. Replace it by another string.

Alright, Nether is now configured to access your AWS account. Now let's create an EC2 instance.

## EC2

Coming soon. Need to decide between creating a template for instances directly at AWS or providing a full tutorial.

## TODO

 - Create a decent documentation
 - Integrate this project with a frontend. Now it is only an API.
 - Manage server files (change server icon, jars, add/remove worlds).
 - Automate steps to create an instance and configure it to host a server (this is somewhat complex).
 - Integrate with S3 for backups, Cloudwatch and other services.

## Changelog

### [0.1.1] - 2020-02-02

#### Fixed:

- ServerMonitor being instantiated multiples times, leading to events being duplicated.

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
