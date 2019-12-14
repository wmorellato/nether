#!/usr/bin/env bash

# credits to https://dev.to/exampro/how-to-run-a-modded-minecraft-server-on-aws-4hlk

JAR_MAJOR_VERSION=1.15
JAR_MINOR_VERSION=8
JAR_NAME=paper-$JAR_MAJOR_VERSION.$JAR_MINOR_VERSION.jar
XMS=-Xms1G
XMX=-Xmx1G
USER=ec2-user

sudo yum -y install java-1.8.0-openjdk
sudo mkdir /home/$USER/minecraft
sudo mkdir /home/$USER/minecraft/bin
sudo chown -R $USER:$USER /home/$USER/minecraft

cd /home/$USER/minecraft/bin
wget https://papermc.io/api/v1/paper/$JAR_MAJOR_VERSION/$JAR_MINOR_VERSION/download
mv download $JAR_NAME
chmod +x $JAR_NAME

cd ..
echo '#By changing the setting below to TRUE you are indicating your agreement to our EULA (https://account.mojang.com/documents/minecraft_eula).
#You also agree that tacos are tasty, and the best food in the world.
#Sat Dec 14 14:59:43 UTC 2019
eula=true' > eula.txt
echo java $XMS $XMX -XX:+UseG1GC -XX:+UnlockExperimentalVMOptions -XX:MaxGCPauseMillis=100 -XX:+DisableExplicitGC -XX:TargetSurvivorRatio=90 -XX:G1NewSizePercent=50 -XX:G1MaxNewSizePercent=80 -XX:G1MixedGCLiveThresholdPercent=35 -XX:+AlwaysPreTouch -XX:+ParallelRefProcEnabled -jar /home/$USER/minecraft/bin/$JAR_NAME nogui > start.sh
chmod +x start.sh