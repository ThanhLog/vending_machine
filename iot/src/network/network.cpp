#include "network.h"
#include "config.h"
#include "services/vending/vending.service.h"
#include <DNSServer.h>
#include <Preferences.h>
#include <WebServer.h>
#include <WiFi.h>

namespace {
constexpr byte DNS_PORT = 53;

IPAddress apIp(192, 168, 4, 1);
IPAddress apGateway(192, 168, 4, 1);
IPAddress apSubnet(255, 255, 255, 0);

WebServer server(80);
DNSServer dnsServer;
Preferences prefs;

String staSsid;
String staPassword;
bool captiveDnsRunning = false;

void handleRoot();

String htmlEscape(String value) {
  value.replace("&", "&amp;");
  value.replace("\"", "&quot;");
  value.replace("<", "&lt;");
  value.replace(">", "&gt;");
  return value;
}

String jsonEscape(String value) {
  value.replace("\\", "\\\\");
  value.replace("\"", "\\\"");
  value.replace("\n", "\\n");
  value.replace("\r", "");
  return value;
}

bool isApClient(IPAddress remoteIp) {
  IPAddress softApIp = WiFi.softAPIP();
  return remoteIp[0] == softApIp[0] && remoteIp[1] == softApIp[1] &&
         remoteIp[2] == softApIp[2];
}

void sendCorsHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

void sendJson(int statusCode, const String &body) {
  sendCorsHeaders();
  server.send(statusCode, "application/json", body);
}

void handleOptions() {
  sendCorsHeaders();
  server.send(204);
}

void redirectToSetup() {
  server.sendHeader("Location", "http://" + WiFi.softAPIP().toString() + "/");
  server.send(302, "text/plain", "");
}

void handleCaptiveProbe() {
  server.sendHeader("Cache-Control", "no-store");
  handleRoot();
}

void updateCaptiveDns() {
  bool shouldRun = WiFi.status() != WL_CONNECTED;

  if (shouldRun && !captiveDnsRunning) {
    dnsServer.start(DNS_PORT, "*", apIp);
    captiveDnsRunning = true;
    Serial.println("Captive DNS started");
  }

  if (!shouldRun && captiveDnsRunning) {
    dnsServer.stop();
    captiveDnsRunning = false;
    Serial.println("Captive DNS stopped");
  }
}

void loadNetworkConfig() {
  prefs.begin("network", true);
  staSsid = prefs.getString("ssid", "Nha Tro Anh Cuong");
  staPassword = prefs.getString("pass", "88888888");
  prefs.end();
}

void saveNetworkConfig() {
  prefs.begin("network", false);
  prefs.putString("ssid", staSsid);
  prefs.putString("pass", staPassword);
  prefs.end();
}

void connectStation() {
  if (staSsid.length() == 0) {
    Serial.println("STA WiFi not configured");
    return;
  }

  WiFi.disconnect(false);
  WiFi.begin(staSsid.c_str(), staPassword.c_str());

  Serial.print("Connecting STA WiFi: ");
  Serial.println(staSsid);

  unsigned long startAt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAt < WIFI_TIMEOUT) {
    dnsServer.processNextRequest();
    server.handleClient();
    delay(100);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("STA IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("STA WiFi timeout, AP mode still running");
  }

  updateCaptiveDns();
}

String getVendingMessage() {
  switch (getVendingStatus()) {
  case VENDING_PROCESSING:
    return "Dang cho vat pham roi...";
  case VENDING_SUCCESS:
    return "Thanh cong: da phat hien vat pham roi";
  case VENDING_ERROR:
    return "Loi: khong phat hien vat pham roi";
  case VENDING_READY:
  default:
    return "San sang";
  }
}

String renderPageStart(const String &title) {
  return "<!doctype html><html lang=\"vi\"><head><meta charset=\"utf-8\">"
         "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
         "<title>" +
         title +
         "</title><style>"
         "body{font-family:Arial,sans-serif;margin:0;background:#101418;color:#fff}"
         "main{max-width:480px;margin:auto;padding:18px}"
         "a{color:#8ecae6}h1{font-size:23px;margin:10px 0 16px}"
         ".panel{background:#18212b;border:1px solid #2a3745;border-radius:8px;padding:14px;margin:12px 0}"
         "label{display:block;color:#b8c4cf;font-size:13px;margin:12px 0 6px}"
         "input{width:100%;box-sizing:border-box;border:1px solid #344454;border-radius:6px;background:#0f151c;color:#fff;padding:11px;font-size:16px}"
         "button{width:100%;border:0;border-radius:7px;padding:14px 10px;background:#1f8cff;color:#fff;font-size:16px;font-weight:700;margin-top:14px}"
         "button:disabled{background:#52606d}.muted{color:#9aabb8;font-size:13px;line-height:1.45}"
         ".grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.buybtn{padding:22px 10px}"
         "#status{min-height:24px;margin-top:14px;color:#ffd166}"
         "</style></head><body><main>";
}

String renderPageEnd() {
  return "</main></body></html>";
}

void handleRoot() {
  String html = renderPageStart("Vending Setup");
  html += "<h1>Cau hinh may ban hang</h1>";
  html += "<div class=\"panel\"><div class=\"muted\">AP dang phat: <b>" +
          String(AP_SSID) + "</b><br>Dia chi: <b>" + WiFi.softAPIP().toString() +
          "</b><br>Client dang ket noi: <b>" +
          String(WiFi.softAPgetStationNum()) + "</b><br>WiFi khu vuc: <b>" +
          String(WiFi.status() == WL_CONNECTED ? "Da ket noi" : "Chua ket noi") +
          "</b></div></div>";

  html += "<div class=\"panel\"><form method=\"post\" action=\"/api/config\">";
  html += "<label>SSID WiFi khu vuc</label><input name=\"ssid\" placeholder=\"Nhap ten WiFi\" value=\"" +
          htmlEscape(staSsid) + "\">";
  html += "<label>Mat khau WiFi</label><input name=\"password\" type=\"password\" value=\"" +
          htmlEscape(staPassword) + "\">";
  html += "<button type=\"submit\">Luu va ket noi WiFi</button>";
  html += "</form></div>";

  html += renderPageEnd();

  server.send(200, "text/html", html);
}

void handleStatus() {
  sendJson(200, "{\"ok\":true,\"apSsid\":\"" + String(AP_SSID) +
                    "\",\"apIp\":\"" + WiFi.softAPIP().toString() +
                    "\",\"clients\":" + String(WiFi.softAPgetStationNum()) +
                    ",\"staConnected\":" +
                    String(WiFi.status() == WL_CONNECTED ? "true" : "false") +
                    ",\"staIp\":\"" +
                    String(WiFi.status() == WL_CONNECTED
                               ? WiFi.localIP().toString()
                               : "") +
                    "\",\"vendingStatus\":\"" + getVendingStatusText() +
                    "\",\"orderNumber\":" + String(getCurrentOrderNumber()) +
                    ",\"message\":\"" + jsonEscape(getVendingMessage()) +
                    "\"}");
}

void handleConfigSave() {
  if (!isApClient(server.client().remoteIP())) {
    server.send(403, "text/plain", "Chi client ket noi AP cua ESP32 moi duoc cau hinh");
    return;
  }

  staSsid = server.arg("ssid");
  staPassword = server.arg("password");

  saveNetworkConfig();
  connectStation();

  server.sendHeader("Location", "/");
  server.send(303);
}

void handleBuy() {
  if (!isApClient(server.client().remoteIP())) {
    sendJson(403,
             "{\"ok\":false,\"message\":\"Chi thiet bi ket noi WiFi cua may "
             "ban hang moi duoc mua\"}");
    return;
  }

  if (!server.hasArg("slot")) {
    sendJson(400, "{\"ok\":false,\"message\":\"Thieu slot\"}");
    return;
  }

  int slot = server.arg("slot").toInt();

  if (slot < 1 || slot > 4) {
    sendJson(400, "{\"ok\":false,\"message\":\"Slot khong hop le\"}");
    return;
  }

  if (!executeRemoteCommand(slot, 0, "local")) {
    sendJson(409, "{\"ok\":false,\"message\":\"May dang xu ly don khac\"}");
    return;
  }

  sendJson(200, "{\"ok\":true,\"message\":\"Da nhan yeu cau mua hang\"}");
}

void initHttpServer() {
  server.on("/", HTTP_GET, handleRoot);
  server.on("/generate_204", HTTP_GET, handleCaptiveProbe);
  server.on("/gen_204", HTTP_GET, handleCaptiveProbe);
  server.on("/hotspot-detect.html", HTTP_GET, handleCaptiveProbe);
  server.on("/library/test/success.html", HTTP_GET, handleCaptiveProbe);
  server.on("/ncsi.txt", HTTP_GET, handleCaptiveProbe);
  server.on("/connecttest.txt", HTTP_GET, handleCaptiveProbe);
  server.on("/fwlink", HTTP_GET, handleCaptiveProbe);
  server.on("/canonical.html", HTTP_GET, handleCaptiveProbe);
  server.on("/success.txt", HTTP_GET, handleCaptiveProbe);
  server.on("/api/status", HTTP_GET, handleStatus);
  server.on("/api/config", HTTP_POST, handleConfigSave);
  server.on("/api/buy", HTTP_POST, handleBuy);
  server.on("/api/buy", HTTP_OPTIONS, handleOptions);
  server.onNotFound(redirectToSetup);
  server.begin();
}
} // namespace

void initWiFi() {
  WiFi.mode(WIFI_AP_STA);

  WiFi.softAPConfig(apIp, apGateway, apSubnet);
  WiFi.softAP(AP_SSID, AP_PASS);
  updateCaptiveDns();

  Serial.print("Vending WiFi: ");
  Serial.println(AP_SSID);
  Serial.print("Vending IP: ");
  Serial.println(WiFi.softAPIP());

  loadNetworkConfig();
  initHttpServer();
  connectStation();
}

void updateNetwork() {
  updateCaptiveDns();
  if (captiveDnsRunning)
    dnsServer.processNextRequest();
  server.handleClient();
}

bool isWiFiConnected() {
  return WiFi.status() == WL_CONNECTED;
}
