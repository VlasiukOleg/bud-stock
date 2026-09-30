<template>
  <UAvatar
    :src="src"
    :text="!src ? initials : undefined"
    :alt="name || initials"
    :size="size"
    :class="uiClass"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  src?: string;
  name?: string;
  email?: string;
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  uiClass?: any;
}>(), {
  size: 'sm'
});

const initials = computed(() => {
  if (props.name) return props.name.substring(0, 2).toUpperCase();
  if (props.email) return props.email.substring(0, 2).toUpperCase();
  return 'U';
});
</script>
