(function (global) {
  global.vip_video_api = 'https://api.minabear.com/vip_video?url={0}'
  global.iqiyi_episodes_api = 'https://api.minabear.com/iqiyi_episodes?q={0}'
  player = new Plyr('#player');

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

  function parseVideoUrl (origin_url, callback) {
    safe_origin_url = encodeURIComponent(origin_url)
    var url = global.vip_video_api.format(safe_origin_url)
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
        curEpisode: '',
        episodes: []
      }
    },
    methods: {
      resetEpisodeList (data) {
        this.curEpisode = ''
        list = []
        for (i = 0; i < data.length; ++i) {
          list.push({
            value: data[i][1],
            label: data[i][0]
          })
        }
        this.episodes = list
      },
      resetVideoSrc (src) {
        player.source = {
          type: 'video',
          sources: [{
            src: src,
            type: 'video/mp4'
          }]
        };
      },
      updateVideo () {
        this.$Message.info('Please wait seconds...');
        parseVideoUrl(this.curEpisode, function (result) {
          if (result.error !== null) {
            this.$Message.error({
              content: 'Failed: ' + result.error,
              duration: 0,
              closable: true
            })
          } else {
            this.$Message.success('All right!')
            this.resetVideoSrc(result.data.src)
          }
        }.bind(this))
      }
    }
  }

  function loadEpisodes (queryName, view) {
    view.$Loading.config({
      color: '#65ff00'
    })

    view.$Loading.start();
    var url = global.iqiyi_episodes_api.format(queryName)
    getJSON(url, function (err, data) {
      if (err !== null) {
        view.$Loading.error()
        view.$Message.error({
          content: 'Failed: ' + err,
          duration: 0,
          closable: true
        })
      } else {
        view.resetEpisodeList(data)
        view.$Loading.finish()
        view.$Message.success('All right!')
      }
    })
  }

  var Component = Vue.extend(Main)
  view = new Component().$mount('#app')
  queryName = window.location.hash.substr(1)
  if (queryName) {
    loadEpisodes(queryName, view)
  }
})(this)
