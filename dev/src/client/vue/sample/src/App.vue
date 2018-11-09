<template>
  <div id="app">
    <form id="app" @submit="checkForm" method="post">
      <p>
        <label for="name">ip: </label>
        <input type="text" name="ip" id="ip" v-model="ip">
      </p>
      <p>
        <input type="submit" value="Submit">
      </p>
      <hr>
      </form>
      <ul>
        <li v-for="error in errors">{{ error }}</li>
      </ul>
      <ul>
        <li v-for="line in lines">{{ line }}</li>
      </ul>
  </div>
</template>
<script>
  const apiUrl = '/hackertarget/reverseiplookup/?q='
  export default {
    name: 'app',
    data() {
        return {
          ip: '195.43.87.94',
          errors: [],
          lines: []
        }
    },
    methods:{
      checkForm:function(e) {
        this.lines = ['loading ..']
        e.preventDefault()
        this.errors = []
        if(this.ip === '') {
          this.errors.push("ip is required.")
        } else {
          fetch(apiUrl+encodeURIComponent(this.ip))
          .then(res => res.text())
          .then(res => {
            if(res.error) {
              this.errors.push(res.error)
            } else {
              this.lines = res.split('\n')
            }
          })
        }
      }
    }
  }
</script>
