package com.leonidas.smoketools;

import android.app.Activity;
import android.app.Instrumentation;
import android.graphics.Rect;
import android.os.Bundle;
import android.view.accessibility.AccessibilityNodeInfo;
import android.util.Xml;
import java.io.StringWriter;
import org.xmlpull.v1.XmlSerializer;

/** Headless emulator-only reader. Unlike uiautomator dump, this does not wait ten seconds
 * for an actively animating game to become idle before returning stale touch coordinates. */
public final class DumpInstrumentation extends Instrumentation {
  @Override public void onCreate(Bundle args) { super.onCreate(args); start(); }
  @Override public void onStart() {
    Bundle result = new Bundle();
    try {
      AccessibilityNodeInfo root = getUiAutomation().getRootInActiveWindow();
      for (int i = 0; root == null && i < 10; i++) {
        Thread.sleep(100);
        root = getUiAutomation().getRootInActiveWindow();
      }
      if (root == null) throw new IllegalStateException("No active Android window");
      StringWriter output = new StringWriter();
      XmlSerializer xml = Xml.newSerializer();
      xml.setOutput(output);
      xml.startDocument("UTF-8", true);
      xml.startTag("", "hierarchy");
      append(root, xml);
      xml.endTag("", "hierarchy");
      xml.endDocument();
      result.putString("hierarchy", output.toString());
      finish(Activity.RESULT_OK, result);
    } catch (Exception error) {
      result.putString("error", error.toString());
      finish(Activity.RESULT_CANCELED, result);
    }
  }
  private void append(AccessibilityNodeInfo node, XmlSerializer xml) throws Exception {
    Rect rect = new Rect(); node.getBoundsInScreen(rect);
    xml.startTag("", "node");
    xml.attribute("", "text", node.getText() == null ? "" : node.getText().toString());
    xml.attribute("", "content-desc", node.getContentDescription() == null ? "" : node.getContentDescription().toString());
    xml.attribute("", "bounds", "[" + rect.left + "," + rect.top + "][" + rect.right + "," + rect.bottom + "]");
    xml.attribute("", "visible", String.valueOf(node.isVisibleToUser()));
    xml.attribute("", "clickable", String.valueOf(node.isClickable()));
    for (int i = 0; i < node.getChildCount(); i++) {
      AccessibilityNodeInfo child = node.getChild(i);
      if (child != null) { append(child, xml); child.recycle(); }
    }
    xml.endTag("", "node");
  }
}
