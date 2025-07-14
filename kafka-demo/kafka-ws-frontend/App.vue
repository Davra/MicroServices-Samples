<script setup>
import { ref, onMounted } from 'vue';
import { VDataTableVirtual } from 'vuetify/components';

const messages = ref([]);

onMounted(() => {
  console.log('Connecting to WebSocket...');
  const ws = new WebSocket(
    `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/microservices/kafkaws`
  );
  ws.onopen = () => {
    console.log('WebSocket connection established');
  };
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    if (error && error.currentTarget) {
      console.error('WebSocket readyState:', error.currentTarget.readyState);
      console.error('WebSocket URL:', error.currentTarget.url);
    }
  };
  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };
  ws.onmessage = (event) => {
    let msg = JSON.parse(event.data);
    if (!Array.isArray(msg)) {
      msg = [msg];
    }
    messages.value.unshift(...msg);
  };
});

// Define table headers
const headers = [
  { title: 'Timestamp', key: 'timestamp', width: 180 },
  { title: 'Topic', key: 'topic', width: 180 },
  { title: 'Partition', key: 'partition', width: 100 },
  { title: 'Value', key: 'value', width: 300 },
];
</script>

<template>
  <main style="max-width:900px;margin:2rem auto;font-family:sans-serif;">
    <h1>Kafka WebSocket Messages</h1>
    <VDataTableVirtual
      :headers="headers"
      :items="messages"
      height="600"
      item-value="timestamp"
      class="elevation-1"
      fixed-header
      :item-height="48"
    />
  </main>
</template>