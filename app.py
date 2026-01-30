import streamlit as st
import google.generativeai as genai
from PIL import Image

# --- PAGE CONFIGURATION ---
st.set_page_config(page_title="Radiology Forensic Expert", layout="wide")

st.title("🩻 Anti-Gravity: Medical Image Authenticity Verifier")
st.markdown("""
This tool uses the **Gemini 1.5 Pro** vision capabilities to distinguish between real radiological 
scans and AI-generated counterparts.
""")

# --- SIDEBAR: API KEY ---
with st.sidebar:
    st.header("Authentication")
    api_key = st.text_input("Enter Gemini API Key:", type="password")
    st.info("Your key is used only for this session and is not stored.")
    
    model_choice = st.selectbox("Select Model:", [
        "gemini-2.5-pro", 
        "gemini-2.5-flash", 
        "gemini-2.0-flash", 
        "gemini-pro-latest", 
        "gemini-flash-latest"
    ])
    st.divider()
    st.caption("Developed for Anti-Gravity Medical Research")

# --- IMAGE UPLOAD SECTION ---
col_ref, col_a, col_b = st.columns(3)

with col_ref:
    st.subheader("1. Reference Image")
    ref_file = st.file_uploader("Upload Input Counterpart", type=['png', 'jpg', 'jpeg'], key="ref")
    if ref_file:
        st.image(ref_file, width='stretch', caption="Reference (Real)")

with col_a:
    st.subheader("2. Image A")
    file_a = st.file_uploader("Upload Test Image A", type=['png', 'jpg', 'jpeg'], key="a")
    if file_a:
        st.image(file_a, width='stretch')

with col_b:
    st.subheader("3. Image B")
    file_b = st.file_uploader("Upload Test Image B", type=['png', 'jpg', 'jpeg'], key="b")
    if file_b:
        st.image(file_b, width='stretch')

# --- ANALYSIS LOGIC ---
if st.button("🔍 Run Forensic Analysis", type="primary"):
    if not api_key:
        st.error("Please provide a Gemini API Key in the sidebar.")
    elif not (ref_file and file_a and file_b):
        st.warning("Please upload all three images to proceed.")
    else:
        try:
            # Initialize Gemini
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(model_choice)
            
            # Prepare Images
            img_ref = Image.open(ref_file)
            img_a = Image.open(file_a)
            img_b = Image.open(file_b)
            
            # The Radiologist Expert Prompt
            prompt = """
            You are a Senior Radiologist and Medical Imaging Forensic Expert. 
            You are given three images:
            1. REFERENCE: A known real medical image.
            2. IMAGE A: A test image.
            3. IMAGE B: A test image.

            One of the test images (A or B) is a REAL medical scan, and the other is an AI-GENERATED (synthetic) version designed to look like the Reference.

            TASK:
            - Compare Image A and B against the Reference.
            - Identify which one is REAL and which one is GENERATED.
            - Provide a detailed 'Verdict' clearly stating: "Image [X] is Real, Image [Y] is Generated."
            - Provide 'Expert Reasoning' focusing on:
                a) Pixel-level artifacts (e.g., GAN checkerboarding, smoothing).
                b) Anatomical accuracy (e.g., vessel branching logic, tissue density consistency).
                c) Sensor noise (Real images have natural stochastic noise; AI often has artificial or 'too clean' noise).
            """
            
            with st.spinner("Analyzing anatomical patterns and pixel artifacts..."):
                response = model.generate_content([prompt, img_ref, img_a, img_b])
                
            st.divider()
            st.subheader("📋 Forensic Report")
            st.write(response.text)
            
        except Exception as e:
            st.error(f"An error occurred: {e}")
            if "404" in str(e):
                st.warning("Trying to list available models...")
                try:
                    for m in genai.list_models():
                        if 'generateContent' in m.supported_generation_methods:
                            st.code(m.name)
                except Exception as list_e:
                    st.error(f"Could not list models: {list_e}")
            elif "429" in str(e):
                st.error("📉 Quota Exceeded. You have hit the rate limit for this model.")
                st.info("Tip: Try switching to a 'Flash' model (e.g., gemini-1.5-flash) which often has higher rate limits, or wait a few seconds before retrying.")

# --- FOOTER ---
st.caption("⚠️ Disclaimer: This is an AI-assisted forensic tool. For research purposes only.")
