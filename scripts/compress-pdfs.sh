#!/usr/bin/env bash
# public/ 配下の PDF を Ghostscript で圧縮する。
# - 画像を 150dpi 相当へダウンサンプル（/ebook）。テキスト・ベクタは劣化しない。
# - 圧縮後にページ数が一致し、かつ小さくなった場合のみ置換する。
# 実行: bash scripts/compress-pdfs.sh
set -u
ROOT="${1:-public}"
before=0; after=0; changed=0; skipped=0

pagecount() {
  gs -q -dNODISPLAY -dNOSAFER -c "($1) (r) file runpdfbegin pdfpagecount = quit" 2>/dev/null
}

while IFS= read -r -d '' f; do
  orig=$(stat -c%s "$f")
  before=$((before+orig))
  tmp="${f}.tmp.pdf"
  gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.5 -dPDFSETTINGS=/ebook \
     -dNOPAUSE -dBATCH -dQUIET -dDetectDuplicateImages=true \
     -dDownsampleColorImages=true -dColorImageResolution=150 \
     -dDownsampleGrayImages=true -dGrayImageResolution=150 \
     -sOutputFile="$tmp" "$f" 2>/dev/null
  if [ ! -s "$tmp" ]; then rm -f "$tmp"; after=$((after+orig)); skipped=$((skipped+1)); echo "SKIP(gsfail) $f"; continue; fi
  new=$(stat -c%s "$tmp")
  p1=$(pagecount "$f"); p2=$(pagecount "$tmp")
  if [ -n "$p1" ] && [ "$p1" = "$p2" ] && [ "$new" -lt "$orig" ]; then
    mv "$tmp" "$f"; after=$((after+new)); changed=$((changed+1))
    printf 'OK  %6.2f->%6.2fMB  %s\n' "$(echo "$orig/1048576"|bc -l)" "$(echo "$new/1048576"|bc -l)" "${f#"$ROOT"/}"
  else
    rm -f "$tmp"; after=$((after+orig)); skipped=$((skipped+1))
    [ "$p1" != "$p2" ] && echo "KEEP(pages $p1!=$p2) ${f#"$ROOT"/}" || echo "KEEP(not smaller) ${f#"$ROOT"/}"
  fi
done < <(find "$ROOT" -type f -iname '*.pdf' -print0)

echo "----"
printf 'compressed: %d | kept: %d\n' "$changed" "$skipped"
printf 'before: %.1f MB -> after: %.1f MB (saved %.1f MB)\n' \
  "$(echo "$before/1048576"|bc -l)" "$(echo "$after/1048576"|bc -l)" "$(echo "($before-$after)/1048576"|bc -l)"
