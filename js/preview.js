let preview = localStorage.getItem('preview');
if (preview) {
    document.open();
    document.write(preview);
    document.close();
}