//************************************************************
// this is a simple example that uses the painlessMesh library
//
// 1. sends a silly message to every node on the mesh at a random time betweew 1 and 5 seconds
// 2. prints anything it recieves to Serial.print
//
//
//************************************************************
#include "painlessMesh.h"

#define   MESH_PREFIX     "ESP-Mesh"
#define   MESH_PASSWORD   "SneakySneaky"
#define   MESH_PORT       5555

#define logMsg(type, body) Serial.println("{\"msgtype\": "+ String(type) +", \"self\": "+ String(mesh.getNodeId()) +", \"body\": "+ String(body) +"}")
#define NETWORK_MAP 0
#define RECEIVED_MSG 1

void sendMessage() ; // Prototype so PlatformIO doesn't complain

painlessMesh  mesh;
Task taskSendMessage( TASK_SECOND * 1 , TASK_FOREVER, &sendMessage );

void receivedCallback( uint32_t from, String &msg ) {
  logMsg(RECEIVED_MSG, "{\"from\": " + String(from) + ", \"msg\": \"" + msg + "\"}");
}

void newConnectionCallback(uint32_t nodeId) {
  Serial.printf("--> startHere: New Connection, nodeId = %u\n", nodeId);
}

void changedConnectionCallback() {
  logMsg(NETWORK_MAP, mesh.subConnectionJson());
}

void nodeTimeAdjustedCallback(int32_t offset) {
  Serial.printf("Adjusted time %u. Offset = %d\n", mesh.getNodeTime(), offset);
}

void setup() {
  Serial.begin(115200);

  //mesh.setDebugMsgTypes( ERROR | MESH_STATUS | CONNECTION | SYNC | COMMUNICATION | GENERAL | MSG_TYPES | REMOTE ); // all types on
  mesh.setDebugMsgTypes( ERROR | STARTUP | CONNECTION );  // set before init() so that you can see startup messages

  mesh.init( MESH_PREFIX, MESH_PASSWORD, MESH_PORT );
  mesh.onReceive(&receivedCallback);
  //mesh.onNewConnection(&newConnectionCallback);
  mesh.onChangedConnections(&changedConnectionCallback);
  //mesh.onNodeTimeAdjusted(&nodeTimeAdjustedCallback);

  mesh.scheduler.addTask( taskSendMessage );
  taskSendMessage.enable();
}

void loop() {
  mesh.update();
}

void sendMessage() {
  String msg = "Hello from node ";
  msg += mesh.getNodeId();
  mesh.sendBroadcast( msg );
  taskSendMessage.setInterval( random( TASK_SECOND * 1, TASK_SECOND * 5 ));
}
