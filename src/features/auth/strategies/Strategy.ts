import * as Axios from 'axios'
import * as OAuth2Strategy from 'passport-oauth2'

const axios = Axios.default

const USER_PROFILE_URL = 'https://open.feishu.cn/open-apis/authen/v1/user_info'

export class Strategy extends OAuth2Strategy.Strategy {
  name = 'feishu'
  _appTokenURL
  _userProfileURL

  constructor(options, verify) {
    super({
      ...options,
      authorizationURL: 'https://open.feishu.cn/open-apis/authen/v1/authorize',
      tokenURL: 'https://passport.feishu.cn/suite/passport/oauth/token'
      // tokenURL: 'https://open.feishu.cn/open-apis/authen/v1/oidc/access_token'
    }, verify)
    this._appTokenURL = 'https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal'
    this._userProfileURL = USER_PROFILE_URL
  }

  getAppAccessToken = function (options) {
    const data = {
      app_id: options.clientId,
      app_secret: options.clientSecret
    };
    return new Promise((resolve, reject) => {
      axios.post(this._appTokenURL, data)
        .then(results => {
          resolve(results['app_access_token'])
          return ''
        })
        .catch(reject)
    });
  };

  userProfile = getUserProfile
}

export const getUserProfile = (accessToken: string, done) => {
  axios.get(USER_PROFILE_URL, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  })
    .then(results => {
      const profile = parse(results.data.data);
      profile.provider = 'feishu';
      done && done(null, profile);
    })
    .catch((e) => done && done(e))
}

export function parse(json) {
  if ('string' == typeof json) {
    json = JSON.parse(json);
  }

  const profile = {} as any
  profile.id = json.user_id;
  profile.name = json.name;
  profile.open_id = json.open_id
  profile.union_id = json.union_id
  profile.avatar = json.avatar_middle

  if (json.email) {
    profile.email = json.email;
  }

  if (json.mobile) {
    profile.mobile = json.mobile;
  }

  return profile;
}
