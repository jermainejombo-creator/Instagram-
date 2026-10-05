import React from 'react';
import { ScrollView, Text } from 'react-native';
import { registerRootComponent } from 'expo';

// If the app fails while loading, show the error on screen instead of closing.
let Root;
try {
  Root = require('./App').default;
} catch (e) {
  const msg = String((e && e.stack) || e);
  Root = function StartupError() {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 24, paddingTop: 70 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#b91c1c' }}>Lumina failed to start</Text>
        <Text style={{ marginTop: 12, fontSize: 12 }} selectable>
          {msg.slice(0, 3000)}
        </Text>
      </ScrollView>
    );
  };
}

registerRootComponent(Root);
