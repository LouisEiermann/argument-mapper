<template>
  <UCard>
    <UTree
      :items="treeItems"
      @select="onNodeSelect"
    />
  </UCard>
</template>

<script setup lang="ts">
import type { TreeItem } from '@nuxt/ui'

interface Node {
  id: number
  documentId?: string
  title: string
  children?: Node[]
  owner?: {
    id: number
    username: string
    avatar?: {
      url: string
    }
  }
  thesis?: boolean
  soundnessDoubted?: boolean
  formalFallacyBelow?: string
  parent?: any
}

const props = defineProps({
  node: {
    type: Object as () => Node,
    required: true,
  },
})

const selectedNode = ref<TreeItem | null>(null)

// Transform the node tree to Nuxt UI Tree format
const transformNodeToTreeItem = (node: Node): TreeItem => {
  const isObjection = node.parent && node.owner?.id !== node.parent?.owner?.id
  const isSupport = node.parent && node.owner?.id === node.parent?.owner?.id
  
  // Determine icon based on node type
  let icon = 'i-heroicons-chat-bubble-left-ellipsis'
  if (node.thesis) {
    icon = 'i-heroicons-light-bulb'
  } else if (isObjection) {
    icon = 'i-heroicons-x-circle'
  } else if (isSupport) {
    icon = 'i-heroicons-check-circle'
  }
  
  const treeItem: TreeItem = {
    label: node.title,
    icon,
    defaultExpanded: true,
    // Store the node data for selection handling
    _nodeData: node,
  }
  
  // Add children if they exist
  if (node.children && node.children.length > 0) {
    treeItem.children = node.children.map(transformNodeToTreeItem)
  }
  
  return treeItem
}

const treeItems = computed(() => {
  if (!props.node) return []
  return [transformNodeToTreeItem(props.node)]
})

const onNodeSelect = (event: any) => {
  const selectedItem = event.detail?.value
  if (selectedItem?._nodeData) {
    const nodeData = selectedItem._nodeData
    // Navigate to the selected node
    navigateTo({
      path: '',
      query: {
        level: nodeData.id,
      },
    })
  }
}
</script>
