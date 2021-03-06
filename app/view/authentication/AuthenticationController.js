Ext.define('MoMo.login.view.authentication.AuthenticationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.authentication',
    requires: [
        'Ext.form.action.StandardSubmit',

        'BasiGX.util.CSRF',
        'BasiGX.util.Url'
    ],

    init: function() {
        Ext.create('Ext.util.KeyNav', {
            target: Ext.getBody().el,
            enter: this.onLoginButton
        });
    },

    onLoginButton: function() {
        var form = Ext.ComponentQuery.query('authdialog')[0];
        var loginUrl = BasiGX.util.Url.getWebProjectBaseUrl() + 'doLogin';

        var urlParams = Ext.Object.fromQueryString(location.search.substring(1));
        if(urlParams && urlParams.clientId) {
            loginUrl = Ext.String.urlAppend(loginUrl, 'clientId=' + urlParams.clientId);
        }

        form.getForm().doAction('standardsubmit', {
            clientValidation: true,
            standardSubmit: true,
            url: loginUrl
        });
    },

    onNewAccount: function() {
        this.redirectTo('registration');
    },

    /**
     *
     */
    onResetClick: function(btn) {
        var me = this,
            pwdResetPanel = btn.up('passwordreset'),
            pwdResetForm = pwdResetPanel.down('form').getForm(),
            reqParams = {
                email: pwdResetForm.findField('email').getValue()
            };

        pwdResetPanel.setLoading(true);

        Ext.Ajax.request({
            url: BasiGX.util.Url.getWebProjectBaseUrl() +
                'user/resetPassword.action',
            method: 'POST',
            headers: BasiGX.util.CSRF.getHeader(),
            params: reqParams,
            success: function(response) {
                pwdResetPanel.setLoading(false);
                var obj = Ext.decode(response.responseText);
                if (obj.success) {
                    Ext.Msg.show({
                        title:'Information',
                        message: 'An email with further instructions ' +
                            'has been sent to your account.',
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.INFO,
                        fn: function() {
                            me.redirectTo('login');
                        }
                    });
                } else {
                    pwdResetPanel.setLoading(false);
                    Ext.Msg.alert('Error', 'Error sending the mail to ' +
                            'your account : ' + obj.message);
                }
            },
            failure: function(response) {
                pwdResetPanel.setLoading(false);
                var obj = Ext.decode(response.responseText);
                Ext.Msg.alert('Error', 'Error sending the mail to ' +
                        'your account : ' + obj.message);
            }
        });
    },

    /**
     *
     */
    onChangeClick: function(btn) {
        var me = this,
            pwdChangePanel = btn.up('passwordchange'),
            pwdChangeForm = pwdChangePanel.down('form').getForm(),
            inputReqParams = pwdChangePanel.reqParams,
            inputReqParamsObj = Ext.Object.fromQueryString(inputReqParams),
            pwdObj = {
                password: pwdChangeForm.findField('password').getValue()
            };

        pwdChangePanel.setLoading(true);

        Ext.Ajax.request({
            url: BasiGX.util.Url.getWebProjectBaseUrl() +
                'user/changePassword.action',
            method: 'POST',
            headers: BasiGX.util.CSRF.getHeader(),
            params: Ext.Object.merge(inputReqParamsObj, pwdObj),
            success: function(response) {
                pwdChangePanel.setLoading(false);
                var obj = Ext.decode(response.responseText);
                if (obj.success) {
                    Ext.Msg.show({
                        title: 'Information',
                        message: 'Your password has been successfully updated.',
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.INFO,
                        fn: function() {
                            me.redirectTo('login');
                        }
                    });
                } else {
                    pwdChangePanel.setLoading(false);
                    Ext.Msg.alert('Error', 'Error updating the password: ' +
                        obj.message);
                }
            },
            failure: function(response) {
                pwdChangePanel.setLoading(false);
                var obj = Ext.decode(response.responseText);
                Ext.Msg.alert('Error', 'Error updating the password: ' +
                    obj.message);
            }
        });
    },

    /**
     * Show an error message if there is one.
     */
    onAfterRenderForm: function() {
        // get div with error msg and pw field
        var errorMsgDiv = Ext.DomQuery.select('div[id=loginerror]')[0];
        var passwordField = this.lookupReference('passwordField');

        if (errorMsgDiv && passwordField) {
            var errorMsgPrefix = "Login failed: ";
            var errorMsg = errorMsgDiv.textContent;

            if(!Ext.isEmpty(errorMsg)) {
                // Mark the pw field as invalid. This will NOT mark the form as
                // invalid, i.e. it is still possible to login.
                passwordField.markInvalid(errorMsgPrefix + errorMsg);

                // avoid that this will be shown again and again if
                // switching between views
                errorMsgDiv.textContent = null;
            }

            // set this value to prevent that the message disappears to fast
            // onPasswordFocus will reset this value and remove the error msg.
            passwordField.preventMark = true;
        }
    },

    /**
     * Reset the preventMark value of the pw field to its default value again.
     * This will allow Ext to remove the error message again.
     */
    onPasswordFocus: function(passwordField) {
        passwordField.preventMark = false;
    }

});
