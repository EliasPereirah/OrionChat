const previewData = localStorage.getItem('preview');
const iframe = document.getElementById('preview-iframe');
if (previewData && iframe) {
    iframe.srcdoc = previewData;
}
document.title = previewData.match("<title>(.*?)</title>")?.[1] ?? 'OrionChat';
