# IoT-Summer-Experiments

### Context 
This project is being developed under the supervision of a summer internship @Software Engineering Laboratory @FEUP. 

The goal of this project is to connect 3 or 4 ESP8266 relying on communication through end-to-end MQQT queues.

These ESP8266 are to collect different types of data through their sensores and to act, (through their relayed actuactors), upon that same data

This project is meant to be iterative and incremental.

On a higher level this venture is meant to help reduce energy consuption through the use of radio communication on such devices.

Power harvesting on Potatoes will be one of the goals 

A browser based of the mesh network shall be available as well 

### Tasks/Ideas

- [ ] Set up a Mesh network foundation
- [ ] Integrate the Mesh Network with MQQT
- [ ] Explore the use of power harvesting
- [ ] Create a network web visualization
- [ ] Do small experiments with sensors/actuators

### Tings used in this project

#### Hardware


Hardware | Quantity  
--- | --- 
nodemcu esp8266 | 6

### Story

#### Background

##### What is a Mesh Network?

A mesh network is a network topology in which each node relays data for the network. All mesh nodes cooperate in the distribution of data in the network. It can be applied to both wired and wireless networks.

Wireless mesh networks can be considered a type of Wireless ad hoc network. Thus, wireless mesh networks are closely related to mobile ad hoc networks (MANETs). Although MANETs are not restricted to a specific mesh network topology, Wireless ad hoc networks or MANETs can take any form of network topology.

_Borrowed from [Wikipedia](https://en.wikipedia.org/wiki/Mesh_networking#frb-inline)_

##### Mesh Networks vs IoT

Mesh networking is emerging as an attractive option for a wide range of low-power, low-data-rate IoT applications.

The key concept behind Internet of Things (IoT) meshing is to enable connected things -- such as lights and thermostats that contain embedded sensor technologies -- to communicate without relying on PCs or dedicated hub services. This makes it much simpler to build a network of connected things and is, as a bonus, relatively inexpensive.

While IoT is mainly discussed in terms of home and building automation, mesh networks are ideal for supporting not only these but also other IoT low-power and low-data-rate applications such as industrial automation, monitoring medical supplies and other things inside hospitals, and even agriculture or oil and gas operations in some of the world's most remote locations.

_Borrowed from [IoT Agenda](http://internetofthingsagenda.techtarget.com/feature/Using-mesh-networking-to-interconnect-IoT-devices)_

##### Approaches 

**Approach #1: ESP8266MQTTMesh**

**Library: https://github.com/PhracturedBlue/ESP8266MQTTMesh**

**Description:**

Self-assembling mesh network built around the MQTT protocol for the ESP8266 with OTA support

_Overview_

Provide a library that can build a mesh network between ESP8266 devices that will allow all nodes to communicate with an MQTT broker. At least one node must be able to see a wiFi router, and there must me a host on the WiFi network running the MQTT broker. The broker is responsible for retaining information about individual nodes (via retained messages) Each node will expose a hidden AP which can be connected to from any other node on the network. Note: hiding the AP does not provide any additional security, but does minimize the clutter of other WiFi clients in the area.

Additionally the library provides an OTA mechanism using the MQTT pathway which can update any/all nodes on the mesh.

This code was developed primarily for teh Sonoff line of relays, but should work with any ESP8266 board with sufficient flash memory

_OTA_

While all nodes must run the same version of the ESP8622MQTTMesh library, each node may run a unique firmware with independent purposes. The main purpose behind this library was to provide a backbone on which several home-automation sensors could be built. As such each node may need different code to achieve its purpose. Because firmwares are large, and memory is limited on the ESP8266 platform, there is only a single memory area to hold the incoming firmware. To ensure that a given firmware is only consumed by the proper nodes, The firmware defines a unique identifier that distinguishes itself from other code. A given firmware is broadcast from the MQTT broker to all nodes, but only nodes with a matching ID will update.

_Borrowed from [PhracturedBlue/ESP8266MQTTMesh](https://github.com/PhracturedBlue/ESP8266MQTTMesh)_

**Result: It didn't work**

**Approach #2:painlessMesh**

**Library: https://gitlab.com/BlackEdder/painlessMesh**

**Description:**

painlessMesh is a library that takes care of the particulars of creating a simple mesh network using Arduino and esp8266.  The goal is to allow the programmer to work with a mesh network without having to worry about how the network is structured or managed.


_True ad-hoc networking_

painlessMesh is a true ad-hoc network, meaning that no-planning, central controller, or router is required.  Any system of 1 or more nodes will self-organize into fully functional mesh.  The maximum size of the mesh is limited (we think) by the amount of memory in the heap that can be allocated to the sub-connections buffer… and so should be really quite high.


_JSON based_

painlessMesh uses JSON objects for all its messaging.  There are a couple of reasons for this.  First, it makes the code and the messages human readable and painless to understand and second, it makes it painless to integrate painlessMesh with javascript front-ends, web applications, and other apps.  Some performance is lost, but I haven’t been running into performance issues yet.  Converting to binary messaging would be fairly straight forward if someone wants to contribute.


_Wifi & Networking_

painlessMesh is designed to be used with Arduino, but it does not use the Arduino WiFi libraries, as I was running into performance issues (primarily latency) with them.  Rather the networking is all done using the native esp8266 SDK libraries, which are available through the Arduino IDE.  Hopefully though, which networking libraries are used won’t matter to most users much as you can just include the .h, run the init() and then work the library through the API.


_painlessMesh is not IP networking_

painlessMesh does not create a TCP/IP network of nodes. Rather each of the nodes is uniquely identified by its 32bit chipId which is retrieved from the esp8266 using the system_get_chip_id() call in the SDK.  Every esp8266 will have a unique number.  Messages can either be broadcast to all of the nodes on the mesh, or sent specifically to an individual node which is identified by its nodeId.

_Borrowed from [BlackEdder/painlessMesh](https://gitlab.com/BlackEdder/painlessMesh)_

**Result: It worked**

#### Diagrams 

### File structure 

### Set up  

### Side efforts 

### Side components 

* Participation in the [Sunset Hackathon](http://sunsethackathon.pt/)


### Authors 

* [Filipa Barros](https://github.com/FilipaBarros)
* [Gonçalo Pereira](https://github.com/G-Pereira)
* [Luís Sousa](https://github.com/Sleepy105)
* [Hugo Sereno Ferreira](https://github.com/hugoferreira)
* [João Pedro Dias](https://github.com/jpdias)

