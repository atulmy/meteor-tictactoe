App.accessRule('*');

App.info({
    name: 'Tic Tac Toe',
    description: 'Tic Tac Toe online with your friends!',
    version: '0.0.1',
    author: 'Atul Yadav',
    email: 'atul.12788@gmail.com',
    website: 'http://atulmy.com'
});

App.icons({
    'android_ldpi': 'public/images/icons/mdpi/ic_launcher.png',
    'android_mdpi': 'public/images/icons/mdpi/ic_launcher.png',
    'android_hdpi': 'public/images/icons/hdpi/ic_launcher.png',
    'android_xhdpi': 'public/images/icons/xhdpi/ic_launcher.png'
});

App.configurePlugin('com.phonegap.plugins.facebookconnect', {
    APP_ID: '880293582007783',
    API_KEY: 'fa564d233412ae91ebbb6bf351aef07e'
});