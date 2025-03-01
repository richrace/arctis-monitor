class ArctisMonitor < Formula
  desc "SteelSeries Arctis headset battery monitor"
  homepage "https://github.com/richrace/arctis-monitor"
  version "0.15.0"

  if Hardware::CPU.arm?
    url "https://github.com/richrace/arctis-monitor/releases/download/v0.0.15/Arctis.Monitor-darwin-arm64-0.0.15.zip"
    sha256 "6e8739b7ba41adcbc1009c117cb89dc0514099e7a7a9eab1ebf79463bcee6ada"
  else
    url "https://github.com/richrace/arctis-monitor/releases/download/v0.0.15/Arctis.Monitor-darwin-x64-0.0.15.zip"
    sha256 "6285aac9a2314e15c8c32e766bf030352ff2014d77e1ff1f58e26c5a4e3166c7"
  end

  def install
    system "unzip", "-qq", Dir["*.zip"].first
    bin.install "arctis-monitor"
  end

  test do
    assert_predicate bin/"arctis-monitor", :exist?
    assert_predicate bin/"arctis-monitor", :executable?
  end
end
