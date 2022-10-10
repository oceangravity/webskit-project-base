<script lang="ts">
  import { defineComponent, h } from 'vue'

  export default defineComponent({
    name: 'WkTool',
    render() {
      return h('wk-tool', null, this.$slots)
    }
  })
</script>
