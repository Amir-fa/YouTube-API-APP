const CLIENT_ID =
  '780082853772-8g4ld97tne6tfvtnmrmtest7suvdsf9l.apps.googleusercontent.com';
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest',
];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

const loginBtn = document.getElementById('log-in');
const logoutBtn = document.getElementById('log-out');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelValue = document.getElementById('channel-value');
const channelVideo = document.getElementById('channel-video');

const defaultChannel = 'TEDxTalks';

channelForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const channel = channelValue.value;

  getChannel(channel);
});

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  gapi.client
    .init({
      discoveryDocs: DISCOVERY_DOCS,
      clientId: CLIENT_ID,
      scope: SCOPES,
      plugin_name: 'AIzaSyBkqjSaEM0FWfJfnML0KPpvWFASyYVXbLk',
    })
    .then(() => {
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

      loginBtn.onclick = handleLogin;
      logoutBtn.onclick = handleLogout;
    });
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    content.style.display = 'block';
    channelVideo.style.display = 'block';
    getChannel(defaultChannel);
  } else {
    loginBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    content.style.display = 'none';
    channelVideo.style.display = 'none';
  }
}

function handleLogin() {
  gapi.auth2.getAuthInstance().signIn();
}

function handleLogout() {
  gapi.auth2.getAuthInstance().signOut();
}

function showChannelData(data) {
  const channelData = document.getElementById('channel-data');

  channelData.innerHTML = data;
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getChannel(channel) {
  gapi.client.youtube.channels
    .list({
      part: 'snippet,contentDetails,statistics',
      forUsername: channel,
    })
    .then((response) => {
      console.log(response);
      const channel = response.result.items[0];

      const output = `
      <ul class="collection">
      <li class="collection-item">Title: ${channel.snippet.title}</li>
      <li class="collection-item">ID: ${channel.id}</li>
      <li class="collection-item">Views: ${numberWithCommas(
        channel.statistics.viewCount
      )}</li>
      <li class="collection-item">Subscribers: ${numberWithCommas(
        channel.statistics.subscriberCount
      )}</li>
      <li class="collection-item">Videos: ${numberWithCommas(
        channel.statistics.videoCount
      )}</li>
    </ul>
    <p>${channel.snippet.description}</p>
    <hr>
    <a class="waves-effect waves-light btn" target="_blank" href="https://youtube.com/${
      channel.snippet.customUrl
    }">
      Visit Channel
    </a>
    
      `;

      showChannelData(output);

      const playlistId = channel.contentDetails.relatedPlaylists.uploads;

      requestVideoPlaylist(playlistId);
    })
    .catch((err) => alert('No channel By that Name'));
}

function requestVideoPlaylist(playlistId) {
  const requestOptions = {
    playlistId: playlistId,
    part: 'snippet',
    maxResults: 10,
  };

  const request = gapi.client.youtube.playlistItems.list(requestOptions);

  request.execute((response) => {
    const playListItems = response.result.items;

    if (playListItems) {
      let output = '<h4>Latest Videos</h4>';
      playListItems.forEach((item) => {
        const videoId = item.snippet.resourceId.videoId;

        output += `
        <div class="video-container">
        <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      </div>`;
      });

      channelVideo.innerHTML = output;
    } else {
      channelVideo.innerHTML = 'No Video!';
    }
  });
}
