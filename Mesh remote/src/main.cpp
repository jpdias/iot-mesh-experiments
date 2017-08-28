//************************************************************
// this is a simple example that uses the painlessMesh library
//
// 1. read the Serial bus for a nodeID.
// 2. tries to send a message to taht nodeID which should be
//    coded to toggle it's BUILTIN_LED when it recieves this
//    message
// 3. Prints all traffic to the Serial bus so it can be parsed
//    by the Serial-to-ELK nodeJS program for "real-time"
//    network visualization
//
//************************************************************
#include <Arduino.h>
#include "painlessMesh.h"

#define   MESH_PREFIX     "ESP-Mesh"
#define   MESH_PASSWORD   "SneakySneaky"
#define   MESH_PORT       5555

#define LED_PIN BUILTIN_LED
String toggleMsg = "toggle";

void sendMessage() ; // Prototype so PlatformIO doesn't complain

painlessMesh  mesh;

void receivedCallback( uint32_t from, String &msg ) {
  if(msg == toggleMsg) {
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
    Serial.println("toggled");
  }

  Serial.printf("startHere: Received from %u msg=%s\n", from, msg.c_str());
}

void newConnectionCallback(uint32_t nodeId) {
    Serial.printf("--> startHere: New Connection, nodeId = %u\n", nodeId);
}

void changedConnectionCallback() {
    Serial.printf("Changed connections %s\n",mesh.subConnectionJson().c_str());
}

void nodeTimeAdjustedCallback(int32_t offset) {
    Serial.printf("Adjusted time %u. Offset = %d\n", mesh.getNodeTime(),offset);
}

void setup() {
  Serial.begin(115200);
  
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH); // on the Wemos D1 Mini the BUILTIN_LED is active low

  //mesh.setDebugMsgTypes( ERROR | MESH_STATUS | CONNECTION | SYNC | COMMUNICATION | GENERAL | MSG_TYPES | REMOTE ); // all types on
  mesh.setDebugMsgTypes( ERROR | STARTUP | CONNECTION | COMMUNICATION );  // set before init() so that you can see startup messages

  mesh.init( MESH_PREFIX, MESH_PASSWORD, MESH_PORT );
  mesh.onReceive(&receivedCallback);
  //mesh.onNewConnection(&newConnectionCallback);
  //mesh.onChangedConnections(&changedConnectionCallback);
  //mesh.onNodeTimeAdjusted(&nodeTimeAdjustedCallback);

}

void loop() {
  mesh.update();

  if(Serial.available()) {
    String msg = Serial.readStringUntil('\n');
    uint32_t id = atoi(msg.c_str());

    if(id = 0 && String(id) != msg)
      Serial.println("ERROR with message");
    else
      mesh.sendSingle(id, toggleMsg);
  }
}
