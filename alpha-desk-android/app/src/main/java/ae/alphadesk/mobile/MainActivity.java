package ae.alphadesk.mobile;
import android.app.Activity;
import android.os.Bundle;
import android.net.Uri;
import android.graphics.Color;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.widget.EditText;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public final class MainActivity extends Activity {
  private WebView web;
  private String approvedHost;
  @Override public void onCreate(Bundle state) {super.onCreate(state);showSetup();}
  private void showSetup() {
    LinearLayout body=new LinearLayout(this);body.setOrientation(1);body.setPadding(30,45,30,20);body.setBackgroundColor(Color.rgb(7,26,34));
    TextView title=new TextView(this);title.setText("◉ Islamic Alpha Desk\nIEX — مراقبة فقط");title.setTextColor(Color.rgb(131,241,193));title.setTextSize(24);body.addView(title);
    TextView hint=new TextView(this);hint.setText("ضع رابط HTTPS الذي حصلت عليه من Railway. لا تدخل مفاتيح Alpaca في الهاتف.");hint.setTextColor(-1);hint.setPadding(0,20,0,20);body.addView(hint);
    EditText address=new EditText(this);address.setSingleLine(true);address.setHint("https://your-app.up.railway.app");address.setTextColor(-1);address.setHintTextColor(Color.LTGRAY);
    address.setText(getPreferences(0).getString("url",""));body.addView(address);
    Button connect=new Button(this);connect.setText("اتصال بالخادم");body.addView(connect);
    connect.setOnClickListener(v -> {String url=address.getText().toString().trim();try{
       Uri u=Uri.parse(url);
       if(!"https".equalsIgnoreCase(u.getScheme()) || u.getHost()==null || u.getHost().isEmpty() || u.getUserInfo()!=null || u.getQuery()!=null || u.getFragment()!=null || u.getPort()>0 && u.getPort()!=443 || u.getPath()!=null && !u.getPath().isEmpty() && !"/".equals(u.getPath())){address.setError("HTTPS domain only");return;}
       approvedHost=u.getHost();getPreferences(0).edit().putString("url",url).apply();open(url);
    }catch(Exception e){address.setError("HTTPS domain only");}});
    setContentView(body);
  }
  private void open(String url) {
    web=new WebView(this);WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
    web.setWebViewClient(new WebViewClient(){@Override public boolean shouldOverrideUrlLoading(WebView w,WebResourceRequest r){Uri u=r.getUrl();return !"https".equalsIgnoreCase(u.getScheme()) || !approvedHost.equalsIgnoreCase(u.getHost());}});
    setContentView(web);web.loadUrl(url);
  }
  @Override public void onBackPressed(){if(web!=null && web.canGoBack())web.goBack();else showSetup();}
}