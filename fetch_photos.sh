#!/bin/bash
# 下载城市照片 -> 校验 -> 压缩至最大1600px；失败回退 picsum
set -u
cd "$(dirname "$0")/photos" || exit 1
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
OSS="https://image-search-mcp-cn-beijing.oss-cn-beijing.aliyuncs.com/image-search-mcp/images-ppt"

declare -a MAP=(
  "tokyo 5ee45e4516c5.jpg"
  "kyoto b4c1ddcebd69.jpg"
  "osaka c56b2418c5a1.jpg"
  "chengdu b243ad629194.jpg"
  "dali 01cd806c9070.jpg"
  "lijiang 2d4d6bd97d13.jpg"
  "marrakech 37e8416573ca.jpg"
  "fes 83d40e766444.jpg"
  "merzouga 8374c0794e78.jpg"
  "reykjavik 667185b2dfd9.jpg"
  "bergen d39ea008234f.jpg"
  "oslo 4fa7fe3e0644.jpg"
  "rome 6b65196031a8.jpg"
  "florence f53938bf34cf.jpg"
  "santorini 5e6833320a3d.jpg"
  "athens 5adf0f048724.jpg"
  "cusco 130c322d63ae.jpg"
  "lima d8f4c3211ce2.jpg"
  "atacama 7e7c35a0019a.jpg"
  "arusha f2d9cbbb2f7a.jpg"
  "serengeti 1b293846f02b.jpg"
  "zanzibar 39a5e8201267.jpg"
  "vancouver 9b33c1de40fe.jpg"
  "banff 2f318c2b88d1.jpg"
  "sanfrancisco 4fe2cea2acaa.jpg"
  "auckland b0e6047ad95f.jpg"
  "queenstown e137254d98f6.jpg"
  "sydney 4292984c6d93.jpg"
  "chiangmai f5eaf5d92d39.jpg"
  "bangkok 9a2d53737c7f.jpg"
  "singapore 640c0c5e29b8.jpg"
  "lisbon 842fe804682b.jpg"
  "porto dd9731e1ec63.jpg"
  "barcelona 6cb4b889d9e8.jpg"
  "paris e6d8ef52ab86.jpg"
  "interlaken 1ed33f85a9b3.jpg"
  "lucerne 58e366ae1f4f.jpg"
)

ok=0; fb=0
for entry in "${MAP[@]}"; do
  slug="${entry%% *}"; path="${entry##* }"
  out="${slug}.jpg"
  curl -fsSL -m 45 -A "$UA" -o "$out" "$OSS/$path" 2>/dev/null
  # 校验: 文件存在 >8KB 且是图片
  if [ -s "$out" ] && [ "$(stat -f%z "$out")" -gt 8192 ] && file -b "$out" | grep -qiE 'JPEG|PNG|WebP'; then
    ok=$((ok+1)); src="search"
  else
    curl -fsSL -m 45 -A "$UA" -o "$out" "https://picsum.photos/seed/${slug}/1400/900" 2>/dev/null
    if [ -s "$out" ] && [ "$(stat -f%z "$out")" -gt 8192 ] && file -b "$out" | grep -qiE 'JPEG|PNG|WebP'; then
      fb=$((fb+1)); src="picsum"
    else
      rm -f "$out"; src="FAILED"
    fi
  fi
  size=$( [ -f "$out" ] && stat -f%z "$out" || echo 0 )
  printf "%-14s %-8s %6dKB\n" "$slug" "$src" "$((size/1024))"
done
echo "---- ok(search)=$ok fallback(picsum)=$fb total=$((ok+fb))/${#MAP[@]}"

# 统一压缩: 最长边 1600px
for f in *.jpg; do
  sips -Z 1600 -s formatOptions 78 "$f" --out "$f.tmp" >/dev/null 2>&1 && mv "$f.tmp" "$f"
done
echo "---- resized to <=1600px; folder size:"
du -sh .
