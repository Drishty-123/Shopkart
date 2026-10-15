import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getMyProfile } from "../services/api";

export default function Home() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    let cancelled = false;
    getMyProfile().then(res => { if (!cancelled) setCustomer(res.data); })
      .catch(() => { if (!cancelled) navigate("/login"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [navigate]);

  if (loading) return <div style={{minHeight:"70vh",display:"grid",placeItems:"center",color:"#68766a"}}>Preparing your space…</div>;
  if (!customer) return null;
  const firstName = customer.fullName?.trim().split(/\s+/)[0] || "there";
  return (
    <main style={{maxWidth:1180,margin:"0 auto",padding:"38px 24px 70px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap",marginBottom:24}}>
        <div><p style={{color:"#708073",fontSize:12,fontWeight:800,letterSpacing:2,textTransform:"uppercase",margin:"0 0 8px"}}>YOUR SHOPKART SPACE</p>
          <h1 style={{fontSize:"clamp(30px,4vw,46px)",lineHeight:1.1,margin:0,fontWeight:800}}>Good to see you, {firstName}<span style={{color:"#8ab943"}}>.</span></h1>
          <p style={{color:"#7b867c",margin:"12px 0 0"}}>A little inspiration for whatever’s next.</p></div>
        <Link to="/products" style={{background:"#c6f36a",color:"#203326",borderRadius:999,padding:"14px 21px",fontWeight:800,fontSize:14}}>Explore the collection <span style={{marginLeft:12}}>↗</span></Link>
      </div>

      <section className="main-hero" style={{position:"relative",overflow:"hidden",background:"#203b2b",borderRadius:28,padding:"clamp(28px,5vw,62px)",color:"#fff",minHeight:310,display:"flex",alignItems:"center",marginBottom:22}}>
        <div style={{maxWidth:560,position:"relative",zIndex:1}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,border:"1px solid #ffffff38",borderRadius:999,padding:"7px 11px",fontSize:11,fontWeight:800,letterSpacing:1.5,color:"#d8f4b0",textTransform:"uppercase"}}><span style={{width:7,height:7,borderRadius:"50%",background:"#c6f36a"}}/> The everyday edit</div>
          <h2 style={{fontSize:"clamp(34px,5vw,58px)",lineHeight:1.02,letterSpacing:-2,margin:"22px 0 16px",fontWeight:800}}>Good things.<br/><span style={{color:"#c6f36a"}}>Chosen well.</span></h2>
          <p style={{maxWidth:400,lineHeight:1.7,color:"#d0d9d0",fontSize:15,margin:"0 0 24px"}}>Find useful favourites, thoughtful upgrades, and little things that make your day better.</p>
          <Link to="/products" style={{display:"inline-block",background:"#fff",color:"#203b2b",borderRadius:12,padding:"13px 18px",fontWeight:800}}>Shop all products&nbsp; ↗</Link>
        </div>
        <div aria-hidden="true" style={{position:"absolute",right:"5%",top:"8%",width:"min(32vw,310px)",height:"min(32vw,310px)",minWidth:190,minHeight:190,borderRadius:"50%",background:"#c6f36a",display:"grid",placeItems:"center",color:"#203b2b",transform:"rotate(-12deg)"}}>
          <div style={{width:"72%",height:"72%",border:"1px solid #203b2b55",borderRadius:"50%",display:"grid",placeItems:"center",textAlign:"center"}}><div><div style={{fontSize:58,lineHeight:1}}>✳</div><div style={{fontSize:11,fontWeight:900,letterSpacing:2,marginTop:12}}>MADE FOR<br/>YOUR EVERYDAY</div></div></div>
        </div>
        <div aria-hidden="true" style={{position:"absolute",right:"31%",bottom:-55,width:130,height:130,borderRadius:"50%",border:"1px solid #ffffff25"}}/>
      </section>

      <section className="home-grid" style={{display:"grid",gridTemplateColumns:"1.2fr 1fr 1fr",gap:16}}>
        <div style={{background:"#fff",border:"1px solid #e6eae2",borderRadius:22,padding:24,minHeight:170}}>
          <div style={{width:40,height:40,display:"grid",placeItems:"center",background:"#edf5e4",borderRadius:13,fontSize:20}}>♙</div>
          <p style={{fontSize:11,letterSpacing:1.5,fontWeight:800,color:"#859086",textTransform:"uppercase",margin:"18px 0 7px"}}>YOUR ACCOUNT</p>
          <h3 style={{fontSize:19,margin:"0 0 15px"}}>{customer.fullName}</h3>
          <p style={{fontSize:13,color:"#7b867c",margin:0,overflowWrap:"anywhere"}}>{customer.email}</p>
        </div>
        <Link to="/orders" style={{background:"#e8eee3",borderRadius:22,padding:24,minHeight:170,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <span style={{fontSize:26}}>↗</span><div><h3 style={{fontSize:20,margin:"0 0 6px"}}>Your orders</h3><p style={{fontSize:13,color:"#69786b",margin:0}}>Track what’s on its way.</p></div>
        </Link>
        <Link to="/wishlist" style={{background:"#f1e9dc",borderRadius:22,padding:24,minHeight:170,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <span style={{fontSize:26}}>♡</span><div><h3 style={{fontSize:20,margin:"0 0 6px"}}>Saved for later</h3><p style={{fontSize:13,color:"#837867",margin:0}}>Your wishlist, all in one place.</p></div>
        </Link>
      </section>
      <section style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:18,flexWrap:"wrap",padding:"25px 4px 0",marginTop:22,borderTop:"1px solid #e3e8df"}}>
        <div><p style={{fontSize:11,letterSpacing:1.5,fontWeight:800,color:"#899389",margin:"0 0 7px"}}>A GOOD PLACE TO START</p><p style={{fontSize:18,fontWeight:700,margin:0}}>Find your next favourite.</p></div>
        <Link to="/products" style={{fontSize:14,fontWeight:800,color:"#315b3b"}}>Browse the shop&nbsp; →</Link>
      </section>
    </main>
  );
}
