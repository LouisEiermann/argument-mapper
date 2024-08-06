<template>
  <div>
    <div>hello</div>
  </div>
</template>
<script setup lang="ts">
  const {find} = useStrapi()

  const response = await find('argument-trees', {populate: 'nodes'})
  console.log(response.data[0])

</script>
