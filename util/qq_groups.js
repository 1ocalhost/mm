(function (global) {
  global.qq_group_api = 'https://api.minabear.com/qq_group/list_user/{0}'

  if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments
      return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
          ? args[number]
          : match
      })
    }
  }

  function getJSON(url, callback) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.responseType = 'json'
    xhr.onload = function () {
      var status = xhr.status
      if (status === 200) {
        callback(null, xhr.response)
      } else {
        callback('HTTP ' + status, xhr.response)
      }
    }
    xhr.withCredentials = true
    xhr.send()
  }

  function query (qqNum, callback) {
    var url = global.qq_group_api.format(qqNum)
    getJSON(url, function (err, data) {
      if (err !== null) {
        callback({
          error: err
        })
        return
      }

      callback({
        error: null,
        data: data
      })
    })
  }

  var Main = {
    data () {
      return {
          qqNum: '10001',
          intQQNum: 0,
          loading: false,
          alertSuccess: '',
          alertError: ''
      }
    },
    methods: {
      resetAlert () {
        this.alertSuccess = ''
        this.alertError = ''
      },
      checkQQNum () {
        var qq = parseInt(this.qqNum)
        if (isNaN(qq) || qq <= 10000) {
          this.alertError = 'invalid QQ number: ' + this.qqNum
          return false
        }
        this.intQQNum = qq
        return true
      },
      listImpl () {
        this.loading = true
        query(this.intQQNum, function (result) {
          if (result.error !== null) {
            this.alertError = 'Failed: ' + result.error
          } else {
            var d = result.data
            groupList = d.length ? d.join(', ') : '<Empty>'
            this.alertSuccess = 'The groups user '
              + this.intQQNum + ' joined:\n' + groupList
          }
          this.loading = false
        }.bind(this))
      },
      toList () {
        this.resetAlert()
        if (!this.checkQQNum()) {
          return
        }
        this.listImpl()
      }
    }
  }

  var Component = Vue.extend(Main)
  new Component().$mount('#app')
})(this)
